
/*
 * author	:	xzl
 * date		:	2016-7-16 14:06
 * describe	:	tcp server
 * test		:
var server = require("./tcp_server").tcp_server(config);
server.start();

var deal_msg = function(data){
	...
};
server.on('deal_msg',function(data,client_addr,callback){
	//console.log(client_addr.name,'got a new msg : ',data);
	var w_data = deal_msg(data);
	callback(w_data);
});
 */
"undefined" != typeof log ? 'log yes' : log = require('./log').New();

var util = require('util');
var events = require("events");
var data_manager = require("./tcp_data_manager");

var is_empty_obj = function(obj){
	for(var k in obj){
		return false;
	}
	return true;
};

function tcp_server(config){
	var self = this;
	
	//config
	self.port = config.port || 8000;//监听端口
	self.timeout = config.timeout || 120;//每个连接未活跃时间,即超时设定,0为不设定超时
	self.reuse = config.reuse || -1;//1次连接最大使用次数   -1为不限制使用次数
	
	self.data_managers = {};//每个连接的data_managers
	self.conns = 0;
	self.server = null;
	self.clients = {};
	self.ip_to_addr = {};
	
	self.reqs = 0;
	self.reqs_sum = 0;
	
	self.get_reqs_sum = function(is_clear){
		var sum = self.reqs_sum;
		is_clear ? self.reqs_sum = 0 : 'no clear';
		return sum;
	};
	
	self.get_client_addr_for_ip = function(ip){
		return self.ip_to_addr[ip] ? self.ip_to_addr[ip] : null; 
	};
	
	self.get_client_addr_for_name = function(name){
		return self.clients[name] ? self.clients[name].addr : null; 
	};
};

util.inherits(tcp_server, events.EventEmitter);

tcp_server.prototype.write = function(client_ip,data,callback){
	var self = this ;
	var addr = self.get_client_addr_for_ip(client_ip);
	if(addr && addr.name){
		if(self.data_managers[addr.name]){
			var success = self.data_managers[addr.name].WriteData(JSON.stringify(data));
			success ? (callback ? callback() : '') :  (callback ? callback('data_managers write data fail') : '');
		}else{
			callback ? callback('fail msg : not data_managers') : '';
		}
	}else{
		var bhave = false;
		for(var name in self.clients){
			if(self.clients[name].addr.ip == client_ip){
				if(self.data_managers[name]){
					var success = self.data_managers[name].WriteData(JSON.stringify(data));
					success ? (callback ? callback() : '') :  (callback ? callback('data_managers write data fail') : '');
				}else{
					callback ? callback('fail msg : not data_managers') : '';
				}
				self.ip_to_addr[client_ip] = self.clients[name].addr;
				bhave = true;
			}
		}
		if(!bhave){
			log.warn('tcp server write get_client_addr_for_ip fail:'+client_ip+','+JSON.stringify(data));
		}
	}
};

tcp_server.prototype.is_valid_conn = function(socket){
	return (true && socket.readable) && socket.writable;
};

tcp_server.prototype.notify = function(json,callback){
	var self = this;
	
	for(var name in self.clients){
		if(self.data_managers[name]){
			var success = self.data_managers[name].WriteData(JSON.stringify(json));
			success ? (callback ? callback() : '') :  (callback ? callback('data_managers write data fail') : '');
		}else{
			callback ? callback('fail msg : not data_managers') : '';
		}
	}
};

tcp_server.prototype.start = function(){
	
	var self = this;
	
	self.server = require("net").createServer();
	
	setInterval(function(){
		self.server.getConnections(function(err,conns){
			if(!err){
				self.conns = conns;
			}else{
				log.warn('tcp server get conns fail!');
			}
		});
	},3000);
	
	setInterval(function(){
		self.reqs = 0;
	},1*1000);
	
	self.server.on('connection', function (client){
		client.addr = {
			ip : client.remoteAddress,
			port : client.remotePort,
			name : client.remoteAddress + ':' + client.remotePort
		};
		
		self.data_managers[client.addr.name] = data_manager.New(client);
		
		client.use_count = 0;
		client.setTimeout(self.timeout*1000);//self.timeout时间没有数据到来 视为超时
		
		
		self.ip_to_addr[client.addr.ip] = client.addr;
		
		self.emit('got_conn',client);
		self.clients[client.addr.name] = client;
		
		
		client.on('data',function (data){
			if(self.is_valid_conn(client)){
				
				self.data_managers[client.addr.name].ReceiveData(data);
				
				while(true){
					var cmdString = self.data_managers[client.addr.name].GetCmdString();
					if(cmdString){
						
						self.reqs += 1;
						self.reqs_sum += 1;
						
						self.emit('deal_msg',cmdString,client.addr,function(data){
							if(self.data_managers[client.addr.name]){
								
								self.data_managers[client.addr.name].WriteData(JSON.stringify(data));
								
								client.use_count += 1;
								if(self.reuse != -1 && client.use_count > self.reuse){
									self.data_managers[client.addr.name].WriteData(JSON.stringify({
										code : -15,
										msg : 'your connection use enough,will end.'
									}));
									client.end();
								}
							}else{
								log.warn('deal_msg cb data fail:'+JSON.stringify(data));
							}
						});
					}else{
						break;
					}
				}
			}else{
				//log.warn(client.addr.name+' is not w & r ,will end.');
				client.end();
			}
		});
		
		client.on('timeout',function (){
			log.warn('tcp svr '+client.addr.name+' time out will end.')
			client.end();
		});
		
		client.on('drain',function(){
			self.data_managers[client.addr.name].SendData();
		});
		
		client.on('end',function (){
			if(self.data_managers[client.addr.name]){
				delete self.data_managers[client.addr.name];
			}
			
			if(self.clients[client.addr.name]){
	    		delete self.clients[client.addr.name];
	    	}
			
			if(self.ip_to_addr[client.addr.ip] && !self.clients[client.addr.name]){
	    		delete self.ip_to_addr[client.addr.ip];
	    	}
		});
		
		client.on('close', function() {
	        log.info('tcp svr '+client.addr.name+' connection close');
	        self.emit('conn_close',client.addr);
	    	if(self.data_managers[client.addr.name]){
				delete self.data_managers[client.addr.name];
			}
	    	
	    	if(self.clients[client.addr.name]){
	    		delete self.clients[client.addr.name];
	    	}
	    	if(self.ip_to_addr[client.addr.ip] && !self.clients[client.addr.name]){
	    		delete self.ip_to_addr[client.addr.ip];
	    	}
		});
 
		client.on('error',function (err){
			log.info('tcp svr '+client.addr.name +' got a error will end. err : '+err);
			if(self.data_managers[client.addr.name]){
				delete self.data_managers[client.addr.name];
			}
			client.destroy();
			if(self.clients[client.addr.name]){
	    		delete self.clients[client.addr.name];
	    	}
			if(self.ip_to_addr[client.addr.ip] && !self.clients[client.addr.name]){
	    		delete self.ip_to_addr[client.addr.ip];
	    	}
		});
	});
	
	self.server.on('error',function(e){
		log.fatal('tcp svr err : '+e);
		process.exit(0);
	});
	
	self.server.on('close',function(){
		log.fatal('tcp svr close');
	});
	
	self.server.listen(self.port,function(){
		log.info("tcp server on " + self.port);
	});
};

exports.New = function(config) {
	return new tcp_server(config);
};
