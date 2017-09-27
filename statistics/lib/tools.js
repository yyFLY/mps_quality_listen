/*
 * @author 	xzl
 * @data	2016-7-26 15:22
 * @file	global_tools.js
 * @工具函数整合
 */
"undefined" != typeof log ? 'log yes' : log = require('./log').New();
var http = require('http');
var fs= require('fs');
var path = require('path');
var crypto = require('crypto');


var g_funs = function(){
	
};


g_funs.prototype.is_ip = function(ip){
	var tmp = ip.split('.');
	if(tmp.length != 4){
		return false;
	}
	for(var i in tmp){
		if(Number(tmp[i]) < 0 || Number(tmp[i]) > 255){
			return false;
		}
	}
	return true;
};

g_funs.prototype.md5 = function(str){
	return crypto.createHash('md5').update(str,'utf8').digest('hex');
};

/*
 * 获取json str 的json对象
 */
g_funs.prototype.is_empty_obj = function(obj){
	for(var name in obj){
		return false;
	}
	return true;
};

/*
 * 获取json str 的json对象
 */
g_funs.prototype.get_json_parse = function(json_str){
    try{
    //	console.log('json:',json_str);
   		var json = JSON.parse(json_str);
   		return json;
    }catch(e){
    	return false;
    }
}

/*
 * 判断socket是否可读可写
 */
g_funs.prototype.is_valid_connection = function(socket){
	return (true && socket.readable) && socket.writable;
};

/*
 * 获取当前时间 秒
 */
Date.prototype.pattern=function(fmt) {         
	var o = {         
	"M+" : this.getMonth()+1, //月份         
	"d+" : this.getDate(), //日         
	"h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时         
	"H+" : this.getHours(), //小时         
	"m+" : this.getMinutes(), //分         
	"s+" : this.getSeconds(), //秒         
	"q+" : Math.floor((this.getMonth()+3)/3), //季度         
	"S" : this.getMilliseconds() //毫秒         
	};         
	var week = {         
	"0" : "/u65e5",         
	"1" : "/u4e00",         
	"2" : "/u4e8c",         
	"3" : "/u4e09",         
	"4" : "/u56db",         
	"5" : "/u4e94",         
	"6" : "/u516d"        
	};         
	if(/(y+)/.test(fmt)){         
	    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));         
	}         
	if(/(E+)/.test(fmt)){         
	    fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);         
	}         
	for(var k in o){         
	    if(new RegExp("("+ k +")").test(fmt)){         
	        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));         
        }         
    }         
    return fmt;         
}

//string format
String.prototype.format = function(args) {
	var result = this;
	if(arguments.length > 0) {
		if(arguments.length == 1 && typeof(args) == "object") {
		for(var key in args) {
			if(args[key] != undefined) {
				var reg = new RegExp("({" + key + "})", "g");
					result = result.replace(reg, args[key]);
				}
			}
		} else {
			for(var i = 0; i < arguments.length; i++) {
				if(arguments[i] != undefined) {
					var reg = new RegExp("({)" + i + "(})", "g");
					result = result.replace(reg, arguments[i]);
				}
			}
		}
	}
	return result;
};

g_funs.prototype.curr_time = function(format_str){
	return (new Date()).pattern(format_str ? format_str : "yyyy-MM-dd_HH:mm:ss");
};

g_funs.prototype.curr_time_days = function(days,format_str){
	var now = new Date();
	now.setDate(now.getDate()+days);
	return now.pattern(format_str ? format_str : "yyyy-MM-dd_HH:mm:ss");
};

g_funs.prototype.save_json_file = function(dir,json,date){
	try{
		var time_ = curr_time().split(':').join('.');
		var dir_ = './'+dir+'/';
		var pathStr = dir_+ (date ? date : time_)+'.json';
		
		//同步
		if (!fs.existsSync(dir_)) {
			fs.mkdirSync(dir_);
		}
		
		fs.writeFileSync(pathStr,JSON.stringify(json));
	}catch(e){
		log.warn(pathStr+' save json to file ex : ' + e);
		return false;
	}
	
	log.info(pathStr+' save json to file success.');
	
	return true;
};

g_funs.prototype.save_json_to_dir = function(dir,filename,json,callback){
	try{
		var dir_ = './'+dir+'/';
		var pathStr = dir_+filename+'.json';
		
		//同步
		if (!fs.existsSync(dir_)) {
			fs.mkdirSync(dir_);
		}
		
		fs.writeFileSync(pathStr,JSON.stringify(json));
		log.info(pathStr+' save json to file success.');
		if(callback){
			callback(true);
		}
	}catch(e){
		log.warn(pathStr+' save_json_to_dir ex : ' + e);
		if(callback){
			callback(false);
		}
	}
};

g_funs.prototype.get_json_by_jsonflie = function(dir,filename){
	try{
		var pathStr = dir+ '/' +filename+'.json';
		
		//同步
		if (fs.existsSync(dir)) {
			var res_str = fs.readFileSync(pathStr);
			return this.get_json_parse(res_str);
		}else{
			return null;
		}
	}catch(e){
		log.warn(pathStr+' get_json_by_jsonflie ex : ' + e);
	}
};

g_funs.prototype.is_array_obj = function(obj){
	return Object.prototype.toString.call(obj) === '[object Array]';
};

g_funs.prototype.clone_obj = function(obj){
	var res = {};
	for(var key in obj){
		res[key] = obj[key];
	}
	return res;
};


g_funs.prototype.quick_sort = function(arr,key,is_asc) {
	var self = this;
	if (arr.length <= 1) { return arr; }
	var pivotIndex = Math.floor(arr.length / 2);
	var pivot = arr.splice(pivotIndex, 1)[0];
	var left = [];
	var right = [];
	
	var sort_fun = function(s1,s2){
		return is_asc ? s1 > s2 : s1 < s2;
	};
	
	for (var i = 0; i < arr.length; i++){
	
		if(key != undefined && arr[i][key] != undefined){
			if (sort_fun(arr[i][key],pivot[key])) {
				left.push(arr[i]);
			}else {
				right.push(arr[i]);
			}
		}else{
			if (sort_fun(arr[i],pivot)) {
				left.push(arr[i]);
			}else {
				right.push(arr[i]);
			}
		}
	}
	return self.quick_sort(left,key,is_asc).concat([pivot], self.quick_sort(right,key,is_asc));
};

//16进制转字符串
g_funs.prototype.hex2string = function(str) {
	return unescape(str.replace(/\\/g, "%"));
};

g_funs.prototype.trim = function(str){
	return str.replace(/(^\s*)|(\s*$)/g, "");
};

g_funs.prototype.encrypt_des = function(data,key,vi){
	var en_code = crypto.createCipheriv('des',key,vi);
	var buf = en_code.update(data,'utf8');
	var buf2 = en_code.final();
	var r = new Buffer(buf.length+buf2.length);
	buf.copy(r);
	buf2.copy(r,buf.length);
	
	return r.toString('base64');
};

g_funs.prototype.set_json_to_str = function(json){
	var res = "";
	for(var a in json){
		res += a+"="+JSON.stringify(json[a])+'&';
	}
	return res.substr(0,res.length-1);
};

g_funs.prototype.decrypt_des = function(data,key,vi){
	var en_code = crypto.createDecipheriv('des',key,vi);
	var buf = en_code.update(data,'base64');
	var buf2 = en_code.final();
	var r = new Buffer(buf.length+buf2.length);
	buf.copy(r);
	buf2.copy(r,buf.length);
	return r.toString('utf8');
};

exports.New = function(){
	return new g_funs();
};
