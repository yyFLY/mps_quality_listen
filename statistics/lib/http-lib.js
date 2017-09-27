exports.New = function(){
	return new HttpManager();
};
function HttpManager(){
	this.http = require('http');
	this.parse = require('url').parse;
	this.querystring = require('querystring');
};

/**
	var url="http://192.168.1.58:80";
	var data = {hello:"world"}
**/
HttpManager.prototype.HttpPost = function(url,data,callback,time){
	var info = this.parse(url)
	  ,	path = info.pathname
	  , contents = data;
	var option = {
		host:info.hostname,
		port:info.port,
		method:"POST",
		path:path,
		headers: {}
	};
	if(typeof(data) == 'object'){
		contents = JSON.stringify(data);
		option.headers['Content-Type'] = 'application/json';
		option.headers['Content-Length'] = new Buffer(contents).length;
	}else if(typeof(data) == 'string'){
		contents = new Buffer(data);
		option.headers['Content-Type'] = 'application/x-www-form-urlencoded';
		option.headers['Content-Length'] = contents.length;
	}
	if(!callback){
		callback = function(){};
	}
	if(time == null){
		time = 30000;
	}
	var req = this.http.request(option);
	var timeOut;
 	var timeOut = setTimeout(function(){
		 req.abort();
		 callback("time out");
 	},time)
	var self = this;
	req.on('connect',function(req,socket,head){
		console.log("connect");
	});
	req.on('response',function(res){
		if(timeOut){
			clearTimeout(timeOut);
		}
		self.Response(res,callback);
	});
	req.on('error',function(e){
		callback(e);
		if(timeOut){
			clearTimeout(timeOut);
		}
		console.log("err",e);
	});
	req.write(contents);
	req.end();
}

/**
	var data = querystring.stringify({cmd:JSON.stringify(obj)});
	var url = "http://192.168.1.58:80/zzc/2.php/?"+data;
	HttpGet("http://192.168.1.58:80/zzc/2.php?"+getStr,function(err,res){
		var ss = '';
		ss+=res.body;
		console.log(err,ss)
	})
**/
HttpManager.prototype.HttpGet = function(url,callback,time){
	var info = this.parse(url)
      , path = info.pathname + (info.search || '')
      , options = {
			host: info.hostname,
			port: info.port || 80,
			path: path,
			method: 'GET'
		};
	if(!callback){
		callback = function(){};
	}
	if(time == null){
		time = 30000;
	}
	var req = this.http.request(options);
	var timeOut;
	 var timeOut = setTimeout(function(){
		 req.abort();
		 callback("time out");
	 },time)
	var self = this;
	req.on('response',function(res){
		if(timeOut){
			clearTimeout(timeOut);
		}
		self.Response(res,callback);
	});
	req.on('error',function(e){
		callback(e);
		if(timeOut){
			clearTimeout(timeOut);
		}
		console.log("err",e);
	});
	req.end();
};

HttpManager.prototype.Response = function(res,callback){
	// console.log("http req revieved!");
	var chunks = []
	  , length = 0;
	res.on('data',function(chunk){
		length += chunk.length;
		chunks.push(chunk);
	});
	res.on('end',function(e){
		if(length>0){
			var data = new Buffer(length);
			for(var i = 0, pos = 0, l = chunks.length; i < l; i++){
				chunks[i].copy(data, pos);
				pos += chunks[i].length;
			}
			res.body = data;
			callback(null, res);
		}
	});
	res.on('error',function(e){
		callback(e, res);
	});
	res.on('aborted',function(){
		callback(new Error('Response aborted'), res);
	});
};

HttpManager.prototype.HttpGet_Yield = function(url,time){
	var self = this;
	return function(done){
		self.HttpGet(url, function(err,res){
	    	done(err, res);
		}, time);
	}
}

HttpManager.prototype.HttpGetJSON_Yield = function(url,time){
	var self = this;
	return function(done){
		self.HttpGet(url, function(err,res){
			// done(err,res);
			// console.log(err,res);
			if(err){
				done(err);
			}else{
				var ss = '';
				ss += res.body;
				try{
					var js = JSON.parse(ss);
					done(null, js);
				}catch(e){
					done({url:url, msg:"NOT JSON", body: ss});
				}
			}
		}, time);
	}
}

// HttpManager.prototype.HttpPost = function(url,data,callback,time){
HttpManager.prototype.HttpPostJSON_Yield = function(url, data, time){
	var self = this;
	return function(done){
		self.HttpPost(url, data, function(err,res){
			// done(err,res);
			// console.log(err,res);
			if(err){
				done(err);
			}else{
				var ss = '';
				ss += res.body;
				try{
					var js = JSON.parse(ss);
					done(null, js);
				}catch(e){
					done({url:url, msg:"NOT JSON", body: ss});
				}
			}
		}, time);
	}
}