

var tcp_waitpool = function(){
	var self = this;
	
	self.timeout = 3*1000;
	self.record = {};
	
	self.push = function(cmd,uuid,callback,end_func,expand_parms,timeout){
		if(!self.record[cmd]){
			self.record[cmd] = {};
		}
		self.record[cmd][uuid] = {
			cb : callback,
			timer : setTimeout(function(){
				if(self.record[cmd] && self.record[cmd][uuid]){
					self.pop(cmd,uuid,'timeout');
				}
			},timeout || self.timeout)
		};
		for(var k in expand_parms){
			self.record[cmd][uuid][k] = expand_parms[k];
		}
		end_func ? end_func() : ''
	};
	
	self.pop = function(cmd,uuid,err,info){
		if(self.record[cmd] && self.record[cmd][uuid]){
			if(self.record[cmd][uuid].timer){
				clearTimeout(self.record[cmd][uuid].timer);
				self.record[cmd][uuid].timer = null;
			}
			self.record[cmd][uuid].cb(err,info);
			delete self.record[cmd][uuid];
		}
	};
	
	self.get = function(cmd,uuid){
		return self.record[cmd] && self.record[cmd][uuid] ? self.record[cmd][uuid] : null;
	};
};

exports.New = function(){
	return new tcp_waitpool();
};
