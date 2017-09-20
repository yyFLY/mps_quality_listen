var util = require('util');
var events = require("events");

"undefined" != typeof tools ? 'tools yes' : tools = require('./lib/tools').New();
"undefined" != typeof log ? 'log yes' : log = require('./lib/log').New();

function getOffsetPath( topic,partition){
    return "/v1/offsets/"+topic+ "/" + partition
}

var http = require("http");


getJSON = function(host,port,path,authstr,callback){
    var url = "http://"+host+":"+port+path
    var time = new Date().getTime();
    var options = {
        hostname: host,
        port: port,
        path: path,
        method: 'GET',
        headers: {
            'Accept':'application/json',
            'Authorization':authstr,
        }
    };
    var timer = null;
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var str = "";
        res.on("data",function(data){
            str += data
        })
        res.on("end",function(){
            clearTimeout(timer);
            var df = new Date().getTime() -time
            var num = Buffer.byteLength(str)/1024;
//          log("GET",url,res.statusCode, num.toFixed(2)+"KB",df+"ms")
            if(str == ""){
                callback(res.statusCode,null,null)
            }else{
                callback(res.statusCode,tools.get_json_parse(str),null)
            }
        })
    }).on('error', function(e) {
        clearTimeout(timer)
        callback(0,null,e)
    });
    timer = setTimeout(function(){
        req.abort();
        if(req.socket)req.socket.end();
    },50000);
    req.end()
}

var mq = function(config){
	var self = this;
	self.mq_ = require("./mq_sdk.js");
	
	self.mq_host = config.mq_host;
	self.mq_port = config.mq_port;
	self.topic = config.topic;
	self.partition = config.partition;
	self.subKey = config.subKey;
	self.maxSize = config.maxSize;
	self.start = config.start ? config.start : null;
	
	self.curr_offest = {};

    self.curr_reqs = 0;
    self.get_curr_reqs = function(bclear){
        if(bclear){
            var num = self.curr_reqs;
            self.curr_reqs = 0;
            return num;
        }
        return self.curr_reqs;
    };
};

util.inherits(mq, events.EventEmitter);

mq.prototype.start_poll = function(){
	var self = this;
	
	self.mq_.SetMQServerAddr(self.mq_host,self.mq_port);
	
	self.poll();
};

mq.prototype.poll = function(){
	var self = this;

	self.partition.forEach(function(par){
		self.mq_.Poll({
	        topic: self.topic,
	        partition: par,
	        subKey: self.subKey,
	        maxSize: self.maxSize,
	        start:self.start,
	        message:function(msg,next){
	          	self.emit('deal_poll_msg',msg);
	          	next();
	        },
	        error:function(err){
	            console.log(err)
	        }
	  	});
	  	
	  	getJSON(self.mq_host,self.mq_port,getOffsetPath(self.topic,par),"mq "+self.subKey,function(code,data,error){
	        if(code == 200){
	        	self.curr_offest[String(par)] = data;
	        	self.curr_offest[String(par)].dis = data.lastOffset - data.offset;
	        }else{
	        	console.log(par,'| err code :',code);
	        }
	    });
	  	setInterval(function(){
	  		getJSON(self.mq_host,self.mq_port,getOffsetPath(self.topic,par),"mq "+self.subKey,function(code,data,error){
		        if(code == 200){
		        	self.curr_offest[String(par)] = data;
		        	self.curr_offest[String(par)].dis = data.lastOffset - data.offset;
		        }else{
		        	console.log(par,'| err code :',code);
		        }
		    });
	  	},60*1000);
	});
};

mq.prototype.push = function(topic,pubKey,partition,msg,callback){
	var self = this;
	
	self.mq_.Push({
        topic: topic,
        pubKey: pubKey,
        partition: partition,
        qos:1,
        ttl:0,
        message:msg,
        success:function(data){
            num++;
            if(callback)
                callback({success : true});
        },
        error:function(err){
            console.log("MqPushMessage ",topic,"error :",err)
            if(callback)
                callback({success : false});
        }
  	});
};

exports.mq = function(config) {
	return new mq(config);
};
