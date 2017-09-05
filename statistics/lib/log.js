var path = require('path');
var util = require('util');
var fs = require('fs');

var log = function(){
	var self = this;
	self.stack = function(){
		var stackArray = [];
		stackArray = (new Error()).stack.split("\n");
		var tmp = '';
		var isHasLoggerjs = false;
		for(var key in stackArray){
			tmp = stackArray[key].indexOf('log.js');
			if( tmp >= 0 ){
				isHasLoggerjs = true;
			}
			if(isHasLoggerjs && (tmp < 0)){
				tmp = stackArray[key].split(path.sep).join('/');
				var tmp2 = tmp.substr( tmp.lastIndexOf('/') );
				tmp = tmp.substr( 0, tmp.lastIndexOf('/') );
				tmp2 = tmp.substr( tmp.lastIndexOf('/') ) + tmp2;
				tmp = tmp.substr( 0, tmp.lastIndexOf('/') );
				tmp = tmp2.substr( 0, tmp2.lastIndexOf(':') );
				break;
			}
		}
		return tmp;
	};
	
	self.format = function(level, date, message){
		var timeString = '' + date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + '-' + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds() + ' ';
		return [timeString, '\t', level.toUpperCase(), '\t', self.stack(), '\t', message, '\n'].join('');
	};
	
	self.write = function(text){
		util.print(text);
	};
	
	self.log = function(level, message){
		self.write( this.format(level, new Date(), message) );
	};
	
	self.fatal = function(message){
		self.log('fatal', message);
	};
	
	self.error = function(message){
		self.log('error', message);
	};

	self.warn = function(message){
		self.log('warn', message);
	};
	
	self.debug = function(message){
		self.log('debug', message);
	};
	
	self.info = function(message){
		self.log('info', message);
	};
};

exports.New = function(){
	return new log();
};

