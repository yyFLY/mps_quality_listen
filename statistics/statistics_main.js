
//moudle
"undefined" != typeof url_model ? 'url_model yes' : url_model = require("url");
"undefined" != typeof cp ? 'cp yes' : cp = require('child_process');
"undefined" != typeof fs ? 'fs yes' : fs = require('fs');
"undefined" != typeof util ? 'util yes' : util = require('util');
"undefined" != typeof events ? 'events yes' : events = require('events');
"undefined" != typeof config ? 'config yes' : config = require('./config').config;
"undefined" != typeof tools ? 'tools yes' : tools = require('./lib/tools').New();
"undefined" != typeof log ? 'log yes' : log = require('./lib/log').New();
// "undefined" != typeof cron ? 'cron yes' : cron = require('cron').CronJob;

//setTimeout(function(){
//	process.exit(10);
//},10*1000);


//let require******************************************
var mq = require("./mq").mq(config.mq);
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


//http_svr
var g_data = null;
http_server.on('deal_msg', function(path,msg,req_ip,callback) {
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
			var returnData = {rtmp_minitue:{},hls_minitue:{}};
		
			if(data.app && data.stream ){
				returnData.rtmp_minitue = summary.get_rtmp_flu_record_for_app_stream(data.app,data.stream,data.start_time,data.end_time);
				returnData.hls_minitue = summary.get_hls_flu_record_for_app_stream(data.app,data.stream,data.start_time,data.end_time);
				returnData.rtmp_hour = summary.get_rtmp_flu_record_for_app_stream_hour(data.app,data.stream,data.start_time,data.end_time);
				returnData.hls_hour = summary.get_hls_flu_record_for_app_stream_hour(data.app,data.stream,data.start_time,data.end_time);
			}
			else{
				returnData.rtmp_minitue = summary.get_rtmp_fluency_record(data.start_time,data.end_time);
				returnData.hls_minitue = summary.get_hls_fluency_record(data.start_time,data.end_time);
				returnData.rtmp_hour = summary.get_rtmp_fluency_record_hour(data.start_time,data.end_time);
				returnData.hls_hour = summary.get_hls_fluency_record_hour(data.start_time,data.end_time);
			}
			res.data = returnData;
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