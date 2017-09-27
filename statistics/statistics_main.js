
//moudle
"undefined" != typeof url_model ? 'url_model yes' : url_model = require("url");
"undefined" != typeof cp ? 'cp yes' : cp = require('child_process');
"undefined" != typeof fs ? 'fs yes' : fs = require('fs');
"undefined" != typeof util ? 'util yes' : util = require('util');
"undefined" != typeof events ? 'events yes' : events = require('events');
"undefined" != typeof config ? 'config yes' : config = require('./config').config;
"undefined" != typeof tools ? 'tools yes' : tools = require('./lib/tools').New();
"undefined" != typeof log ? 'log yes' : log = require('./lib/log').New();
"undefined" != typeof local_info ? 'local_info yes' : local_info = require('./status/local_info').New(config.status_threshold);

"undefined" != typeof crypto ? 'crypto yes' : crypto = require('crypto');
"undefined" != typeof request ? 'request yes' : request = require('request');
"undefined" != typeof md5 ? 'md5 yes' : md5 = require('md5');

//setTimeout(function(){
//	process.exit(10);
//},10*1000);


//let require******************************************
var mq = require("./mq").mq(config.mq);
//var playerInfo_mq = require("./mq").mq(config.playerInfo_mq);
var http_server = require('./lib/http_server').New(config.http);//http svr
var summary = require('./summary.js').New();

//event******************************************
//proess quit******************************************
process.on('exit',function(code){
	log.fatal('process exit '+ code);
	if(code !== 99){
		summary.save_record(function(success){
			log.info('summary save_record success');
		});
	}
});

process.on('SIGTERM', function(){
	log.fatal('process SIGTERM');
	summary.save_record(function(success){
		log.info('summary save_record success');
		process.exit(99);
	});
});

PROCESS_STATUS_UPDATE_INTERVAL = 60 * 1000;

setInterval(function(){
	var reqs = mq.get_curr_reqs(true);
	local_info.update_status(reqs?reqs/PROCESS_STATUS_UPDATE_INTERVAL:0);
	local_info.check_warn();
},PROCESS_STATUS_UPDATE_INTERVAL);
// 解析cookie
var parseCookie = function(cookie) {
        var cookies = {};
        if (!cookie) {
                return cookie;
        }
        var list = cookie.split(';');
        for (var i = 0; i < list.length; i++) {
                var pair = list[i].split('=');
                cookies[pair[0].trim()] = pair[1];
        }
        return cookies;
};
// cookie 序列化
// cookie 序列化
// cookie 格式：name=value; Path=/; Expires=Sun, 23-Apr-23 09:01:35 GMT; Domain=.domain.com;
function serialize(name, val, opt) {
		var pairs = [name + '=' + val];
		opt = opt || {};

		if (opt.maxAge) pairs.push('Max-Age=' + opt.maxAge);
		if (opt.domain) pairs.push('Domain=' + opt.domain);
		if (opt.path) pairs.push('Path=' + opt.path);
		if (opt.expires) pairs.push('Expires=' + opt.exppires.toUTCString());
		if (opt.httpOnly) pairs.push('HttpOnly');
		if (opt.secure) pairs.push('Secure');

		return pairs.join(';');
}
//加密
function decode(key,encrypt_text,iv) {
	var key = new Buffer(key);
    var iv = new Buffer(iv ? iv : 0);
    var decipher = crypto.createDecipheriv('des-cbc', key, iv);
    decipher.setAutoPadding(true);
    var txt = decipher.update(encrypt_text, 'base64', 'utf8');
    txt += decipher.final('utf8');
    return txt;
}
//解密
function encode(key,plaintext,iv) {
	var key = new Buffer(key);
	var iv = new Buffer(iv ? iv : key);
	var cipher = crypto.createCipheriv('des-cbc',key, iv);
	cipher.setAutoPadding(true) //default true
	var ciph = cipher.update(plaintext, 'utf8', 'base64');
	ciph += cipher.final('base64');
	return ciph;
}



//http_svr
var g_data = null;
http_server.on('deal_msg', function(path,msg,req_ip,req,resp,callback) {
		
	var data = tools.get_json_parse(msg);
	if(!data){
		log.warn('http server deal_msg get_json_parse err:'+msg+', req_ip:'+req_ip);
		callback({
			code : -3,
			msg : 'req json parse err'
		},400);
		return;
	}
	var res = {
		code : 0
	};
	var code = 200;
	

	switch (path){
		case '/':
			res.data = g_data;
			break;
		case '/login':				
			var u_email  = data.email;
			var u_password  = data.password;//接收用户名密码			
			var callme = {Flag:110,FlagString:'登录失败',data:{}};

			var str = u_password;
			var md5 = require("md5");
			var u_md5password = md5(str);//密码md5加密	

			var key = 'JFswrLIT';
			var str = '{"Tag":"login","email":"'+u_email+'","password":"'+u_md5password+'","Api":"admin\/account"}';
			var iv = 'JFswrLIT';
			var enc = encode(key,str, iv);//内容对称加密后进行发送	

			var requestData = enc ;
			var url= "http://privateapi.aodianyun.com/index.php";
			request({
				url: url,
				method: "post",
				json: true,
				headers: {
					"content-type": "application/json",
				},
				body: requestData
			},requestData, function(error, response, body) {					
					if(body.Flag == 100){	
						callme.Flag = 100 ;
						callme.FlagString = '登录成功';
    					resp.setHeader('Set-Cookie', serialize('isVisit','1'));	
						
						res.data = callme;
						callback(res,code);
					}
					else{						
    					resp.setHeader('Set-Cookie', serialize('isVisit','0'));
						res.data = callme;
						callback(res,code);
					}
				
			}); 
			return;
		case '/get_sum':
			res.data = summary.sum;
			break;
		case '/get_fluency_record':
			res.data = summary.get_fluency_record(data.start_time,data.end_time);
			break;
		case '/get_fluency_curr':
			res.data = summary.summary_mintiue;
			break;
		case '/get_rtmp_fluency_record':
			res.data = summary.get_rtmp_fluency_record(data.start_time,data.end_time);
			break;
		case '/get_hls_fluency_record':
			res.data = summary.get_hls_fluency_record(data.start_time,data.end_time);
			break;
		case '/get_rtmp_flu_record_for_app_stream':
			res.data = summary.get_rtmp_flu_record_for_app_stream(data.app,data.stream,data.start_time,data.end_time);
			break;	
		case '/get_hls_flu_record_for_app_stream':
			res.data = summary.get_hls_flu_record_for_app_stream(data.app,data.stream,data.start_time,data.end_time);
			break;
		case '/get_rtmp_fluency_record_hour':
			res.data = summary.get_rtmp_fluency_record_hour(data.start_time,data.end_time);
			break;
		case '/get_hls_fluency_record_hour':
			res.data = summary.get_hls_fluency_record_hour(data.start_time,data.end_time);
			break;
		case '/get_rtmp_flu_record_for_app_stream_hour':
			res.data = summary.get_rtmp_flu_record_for_app_stream_hour(data.app,data.stream,data.start_time,data.end_time);
			break;	
		case '/get_hls_flu_record_for_app_stream_hour':
			res.data = summary.get_hls_flu_record_for_app_stream_hour(data.app,data.stream,data.start_time,data.end_time);
			break;
		case '/get_rtmp_flu_range_for_app_stream_minitue':
			res.data = summary.get_rtmp_flu_range_for_app_stream_minitue();
			break;
		case '/get_mps_summary':
			req.cookies = parseCookie(req.headers.cookie);
		
			if(req.cookies == null || req.cookies.isVisit != 1){
				var callmes = {Flag:120,FlagString:'请登录',data:{}};
				res.data = callmes;
				break;
			}
			var returnData = {rtmp_minitue:{},hls_minitue:{},
			rtmp_range_minite:[],hls_range_minite:[],rtmp_hour:[],hls_hour:[]};
		
			if(data.app && data.stream ){
				if(data.minSearch){
					returnData.rtmp_minitue = summary.get_rtmp_flu_record_for_app_stream(data.app,data.stream,data.start_time,data.end_time);
					returnData.hls_minitue = summary.get_hls_flu_record_for_app_stream(data.app,data.stream,data.start_time,data.end_time);
				}
				if(data.hourSearch){
					returnData.rtmp_hour = summary.get_rtmp_flu_record_for_app_stream_hour(data.app,data.stream,data.start_time,data.end_time);
					returnData.hls_hour = summary.get_hls_flu_record_for_app_stream_hour(data.app,data.stream,data.start_time,data.end_time);
				}
			}
			else{
				if(data.minSearch){
					returnData.rtmp_minitue = summary.get_rtmp_fluency_record(data.start_time,data.end_time);
					returnData.hls_minitue = summary.get_hls_fluency_record(data.start_time,data.end_time);
				}
				if(data.hourSearch){
					returnData.rtmp_hour = summary.get_rtmp_fluency_record_hour(data.start_time,data.end_time);
					returnData.hls_hour = summary.get_hls_fluency_record_hour(data.start_time,data.end_time);
				}
			}
			if(data.rtmpRange){
				returnData.rtmp_range_minite = summary.get_rtmp_flu_range_for_app_stream_minitue();
			}	
			if(data.hlsRange){
				returnData.hls_range_minite = summary.get_hls_flu_range_for_app_stream_minitue();
			}	
			
			var callmes = {Flag:100,FlagString:'查询成功',data:returnData};
			res.data =  callmes;
			var returnData = '';
			break;
		default :
			fs.readFile(config.html_path+path, "binary", function (err, data) {			
				if (err) {
					log.warn('unkown path:'+path+', req_ip:'+req_ip);
					callback({
						code : -1,
						msg : 'unkown interface'
					},400);
				} else {
					callback(data,200,true);
				}
			});
			return;
	}
			
	callback(res,code);
});
//mq
mq.on('deal_poll_msg',function(msg){
	if(!msg.body){
		log.warn('mq no body msg:'+JSON.stringify(msg));
		return;
	}
	var data = tools.get_json_parse(msg.body);
	
	if(!data){
		log.warn('mq deal_msg get_json_parse err, msg:'+msg.body);
		return;
	}
	
	//deal_mq_data

	//log.debug(JSON.stringify(data));
	summary.dealAll(data);
	g_data = data;
});

//start******************************************
summary.init_record();
http_server.start();
mq.start_poll();
MAX_PAR_DIS = 1000;
CHECK_PAR_DIS_INTERVAL = 60*1000;
setInterval(function(){
	for(var par in mq.curr_offest){
		if(mq.curr_offest[par].dis && mq.curr_offest[par].dis > MAX_PAR_DIS){
			log.warn("{0} par warn at {1}".format(par,JSON.stringify(mq.curr_offest[par])));
		}
	}
	//log.info('par info:'+JSON.stringify(mq.curr_offest));
},CHECK_PAR_DIS_INTERVAL);