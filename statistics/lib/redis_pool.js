
"undefined" != typeof log ? 'log yes' : log = require('./log').New();

var events = require("events");
var util = require('util');

var redis_pool = function(config){
	var self = this;
	
	self.redis_model = require('redis');
	
	self.size = config.size || 30;
	self.retry_time = config.retry_time || 100;
	self.port = config.port || 6379;
	self.host = config.host;
	self.psd = config.psd;
	
	self.waitpool = [];
	self.pool = [];
	
	self.bwork = false;
	self.curr_index = 0;
	self.timer = null;
	
	self.init = function(){
		for(var i = 0  ; i < self.size ; i ++){
			self.create_client(i);
		}
	};
	
	self.info = function(){
		return {
			pool : self.pool.length,
			waitpool: self.waitpool.length
		};
	};
	
	self.create_client = function(index){
		var client = self.redis_model.createClient(self.port,self.host,{h_pass : self.psd});
		client.bready = false;
		client.index = index;
		client.on('ready',function(){
			client.bready = true;
		});
		client.on('reconnecting',function(info){
			log.warn('redis client #'+client.index+' reconnecting,info:'+JSON.stringify(info));
		});
		client.on('error',function(err){
			client.bready = false;
			log.warn('redis client #'+client.index+' reconnecting,info:'+JSON.stringify(info));
		});
		client.on('end',function(){
			client.bready = false;
			log.warn('redis client #'+client.index+' reconnecting,info:'+JSON.stringify(info));
		});
		
		self.pool.push(client);
	};
	
	self.get_client = function(){
		for(var i in self.pool){
			self.index += 1;
			if(self.index >= self.size){
				self.index = 0;
			}
			if(self.pool[self.index] && self.pool[self.index].bready){
				return self.pool[self.index];
			}
		}
		return null;
	};
	
	self.get_connection = function(callback){
		if(callback){
			self.waitpool.push(callback);
			self.emit('work');
		}
	};
	
	self.on('work',function(){
		self.bwork = true;
		if(self.timer){
			clearTimeout(self.timer);
		}
		while(self.waitpool.length > 0){
			var client = self.get_client();
			if(client){
				var cb = self.waitpool.shift();
				try{
					cb(client);
				}catch(e){
					log.info('redis pool callback ex:'+JSON.stringify(e));	
				}
			}else{
				self.timer = setTimeout(function(){
					self.emit('work');
				},self.retry_time);
				self.bwork = false;
				break;
			}
		}
		self.bwork = false;
	});
	
	self.init();
};

util.inherits(redis_pool, events.EventEmitter);

exports.New = function(config){
	return new redis_pool(config);
};
