var http = require("http");
var querystring = require("querystring");

// var host = "test.vvku.com"
// var port = 8800
// var host = "api.mq.aodianyun.com"
var host = "test.vvku.com"
var port = 8800
var pollMap = []
exports.LOG = false;
function log(){
	if(exports.LOG){
		console.log.apply(null,arguments);
	}
}

function GetJsonParse(str)
{
    var obj = null;
    try{
        obj = JSON.parse(str);
    }catch(e){
//      Logger.warn("JSON parse Error str:" + str);
        return false;
    }
    return obj; 
}

function getOffsetPath( topic,partition){
    return "/v1/offsets/"+topic+ "/" + partition
}
function getPollPath( topic,partition,offset,maxSize){
    if(maxSize != null && maxSize > 0){
        return "/v1/messages/"+topic+ "/" + partition+"/"+offset+"?maxSize="+maxSize
    }
    return "/v1/messages/"+topic+ "/" + partition+"/"+offset
}
function getPushPath( topic,partition){
    if(partition != null){
         return "/v1/messages/"+topic+ "/" + partition
    }
    return "/v1/messages/"+topic
}


function postJSON(host,port,path,data,authstr,callback){
    var url = "http://"+host+":"+port+path
    var dataStr = JSON.stringify(data);
    var time = new Date().getTime();
    var options = {
        hostname: host,
        port: port,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept':'application/json',
            'Authorization':authstr,
            'Content-Length': Buffer.byteLength(dataStr)
        }
    };
  	var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var str = "";
        res.on("data",function(data){
            str += data
        })
        res.on("end",function(){
            var df = new Date().getTime() -time
            var num = Buffer.byteLength(dataStr)/1024;
            log("POST:",url,res.statusCode,num.toFixed(2)+"KB",df+"ms")
            if(str == ""){
                callback(res.statusCode,null,null)
            }else{
                callback(res.statusCode,GetJsonParse(str),null)
            }
        })
    }).on('error', function(e) {
        callback(0,e)
    });
    req.write(dataStr);
    req.end();
}
exports.Save = function( options ) {//topic partition start
	if(options.topic == null){
        throw new Error("argument error topic not set")
    }if (options.partition == null || Number(options.partition) < 0){
        throw new Error("argument error partition error")
    }
	saveOffset(options,function(err){
		if(options.success && !err )options.success(subOption.start)
		if(options.error && err) options.error(subOption.start,err)
	})
}
exports.UnPoll = function(options){
    if(options.topic == null){
        throw new Error("argument error topic not set")
    }if (options.partition == null || Number(options.partition) < 0){
        throw new Error("argument error partition error")
    }
    var subOption = pollMap[options.topic+"/"+options.partition]
    if (subOption != null){
		delete pollMap[options.topic+"/"+options.partition]
        subOption.message = null
        subOption.error = null
        subOption.stop = true;
        subOption.needSave = true;
		var num = 0;
		var callback = function(err){
			if(err){
				if( ++num <= 3 ){
					setTimeout(saveOffset,num*1000,subOption,callback);
					return
				}
			}
			if(options.success && !err )options.success(subOption.start)
			if(options.error && err) options.error(subOption.start,err)
		}
        saveOffset(subOption,callback)
    }
}

demo = function(){
	
};
exports.Poll =function(options){
    if(options.topic == null){
        throw new Error("argument error topic not set")
    } if (options.message == null || typeof options.message != "function" ){
        throw new Error("argument error message not set")
    } if (options.partition == null || Number(options.partition) < 0){
        throw new Error("argument error partition error")
    }
    if (options.subKey == null ){
        throw new Error("argument error subKey error")
    }
    if(pollMap[options.topic+"/"+options.partition]){
        throw new Error("already subed") 
    }
    pollMap[options.topic+"/"+options.partition] = options;
    options.topic = querystring.escape(options.topic)
    if(null == options.start){
        getJSON(host,port,getOffsetPath(options.topic,options.partition),"mq "+options.subKey,function(code,data,error){
            if(code == 200){
                if(data){
//              	console.log('data:',data);
                    options.start = data.lastOffset;
//                  if (data.startOffset > data.offset){
//                      options.start = data.startOffset
//                  }
                }
                if(options.stop){
                    return
                }
				options.queue = [];
				options.needcall = true;
                poll(options)
                startSaveOffset(options);
            }else{
				delete pollMap[options.topic+"/"+options.partition]
                if(options.error){
                    if(error != null){
                        options.error({code:101,error:error})
                    }else{
                        options.error({code:code,error:data.error})
                    }
                }
            }
        })
    }else{
        options.queue = [];
        options.needcall = true;
        poll(options)
        startSaveOffset(options);
    }
}
function goNext(options){
	if(options.queue.length > 0 ){
		if(!options.needcall){
			return
		}
		if(!options.message) {
			return
		}
		options.needcall = false
		var item = options.queue.shift()
		options.message(item,function(){
			options.start = item.offset+1;
			options.needSave = true;
			options.needcall = true;
			 setImmediate(function(){
				goNext(options)
			});
		})
	}else{
		poll(options);
	}
}
function poll(options){
    if(options.stop){
        return
    }
    var path =  getPollPath(options.topic,options.partition,options.start,options.maxSize)
    getJSON(host,port,path,"mq "+options.subKey,function(code,data,error){
        if(code == 200){
            if(data)
    			options.queue = options.queue.concat(data.list)
			goNext(options);
        }else{
			if(options.offline){
				if(error != null){
					options.offline({code:101,error:error})
				}else{
					options.offline({code:code,error:data.error})
				}
			}
            setTimeout(poll,300,options)
        }
    });
}
function startSaveOffset(options){
    if(!options.timer){
        options.timer = setTimeout(saveOffset,3000,options,function(){
            if(options.stop) return
            startSaveOffset(options)
        })
    }
}
function saveOffset(options,callback){
	// console.log("saveOffset",options.needSave)
    options.timer = null
    if( options.needSave ){
        options.needSave = false
        postJSON(host,port,getOffsetPath(options.topic,options.partition),{offset:options.start},"mq "+options.subKey,function(code,data,error){
            if(code == 201){
				if(callback) callback()
            }else{
                options.needSave = true
				if(error != null){
					if(callback)callback({code:101,error:error})
				}else{
					if(callback)callback({code:code,error:data.error})
				}
            }
			
        })
    }else{
        if(callback) callback()
    }
}

exports.Push = function(options){
    options.topic = querystring.escape(options.topic)
    var path = getPushPath(options.topic,options.partition);
    postJSON(host,port,path,{body:options.message,ttl:options.ttl,qos:options.qos},"mq "+options.pubKey,function(code,data,error){
        if(code==201 && data){
            if(options.success){
                options.success(data)
            }
        }else{
            if(options.error){
                if(error != null){
                    options.error({code:101,error:error})
                }else{
                    options.error({code:code,error:data.error})
                }
            }
        }
    })
}

exports.SetMQServerAddr = function(mqHost,mqPort){
    host = mqHost;
    port = mqPort;
}
