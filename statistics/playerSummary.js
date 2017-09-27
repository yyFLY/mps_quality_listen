

SUMMARY_TYPE = {
	MINUTE : 0,
	HOUR : 1
};
DATA_TYPE = {
	HLS : 0,
	RTMP : 1
};
SUMMARY_SEARCH = {
	STREAM : 0,
	ALL : 1
};

MINUTE = 60 * 1000;

var playerSummary = function(config){
	var self = this;

	//app/stream search
	self.rtmp_summary_minitue = {
			// "app" : {
			// 	"stream" : {
			// 		sum : 0,
			// 		PlayerLoadTime : 0,
			//		data:[]
			// 	}
			// }
	};
	//统计每分钟rtmp的流畅度 按app stream查询
	self.rtmp_history_flu_summary = {	
		// "appname":{
		// 	"streamname":{
		// 		times :[123,4234],
		// 		flu :[100,100],
		//		sum:[]
		// 	}
		// }
	};
	self.hls_summary_minitue = {};
	//统计每分钟hls的流畅度 按app stream查询
	self.hls_history_flu_summary = {};

	//最近一分钟的流水记录
	self.lastminitue_rtmp_summary_minitue = {};
	self.lastminitue_hls_summary_minitue = {};
	//总的流畅度
	self.rtmp_summary_mintiue_sum = {
		sum : 0,
		successSum:0,
		playerLoadTime : 0	,
		data:[]
	};
	self.rtmp_history_flu_summary_sum = [
		// {
		// 	time : new Date().getTime(),
		// 	flu : 0
		// }
	];
	self.hls_summary_mintiue_sum = {
		sum : 0,
		successSum: 0,
		playerLoadTime : 0,
		data:[]
	};
	self.hls_history_flu_summary_sum = [];


	//近30日的
	//app/stream search
	self.rtmp_summary_hour = {};
	self.rtmp_history_flu_summary_hour = {};
	self.hls_summary_hour = {};
	self.hls_history_flu_summary_hour = {};
	//总的流畅度
	self.rtmp_summary_hour_sum = {
		sum : 0,
		successSum: 0,
		playerLoadTime : 0
	};
	self.rtmp_history_flu_summary_sum_hour = [];
	self.hls_summary_hour_sum = {
		sum : 0,
		successSum: 0,
		playerLoadTime : 0
	};
	self.hls_history_flu_summary_sum_hour = [];

	self.dealAll = function(data){

		if(data.App && data.Stream && data.PlayerLoadTime !== undefined && data.ProtocolType == 'rtmp'){
			self.rtmp_summary_minitue[data.App] = self.rtmp_summary_minitue[data.App] || {};
			self.rtmp_summary_minitue[data.App][data.Stream] = self.rtmp_summary_minitue[data.App][data.Stream]  || {
				sum : 0,
				successSum : 0,
				playerLoadTime : 0,
				data : []
			};
			self.rtmp_summary_minitue[data.App][data.Stream].sum += 1;
			self.rtmp_summary_minitue[data.App][data.Stream].playerLoadTime += parseFloat(data.PlayerLoadTime);
			self.rtmp_summary_minitue[data.App][data.Stream].data.push(data);
			if(data.PlayStatus == 'success'){				
				self.rtmp_summary_minitue[data.App][data.Stream].successSum += 1;
			}
		}
		if(data.App && data.Stream && data.PlayerLoadTime !== undefined && data.ProtocolType == 'hls'){
			self.hls_summary_minitue[data.App] = self.hls_summary_minitue[data.App] || {};
			self.hls_summary_minitue[data.App][data.Stream] = self.hls_summary_minitue[data.App][data.Stream]  || {
				sum : 0,
				successSum : 0,
				playerLoadTime : 0,
				data : []
			};
			self.hls_summary_minitue[data.App][data.Stream].sum += 1;
			self.hls_summary_minitue[data.App][data.Stream].playerLoadTime += parseFloat(data.PlayerLoadTime);
			self.hls_summary_minitue[data.App][data.Stream].data.push(data);
			if(data.PlayStatus == 'success'){				
				self.hls_summary_minitue[data.App][data.Stream].successSum += 1;
			}
		}

		if(data.PlayerLoadTime !== undefined  && data.ProtocolType == 'rtmp'){	
			self.rtmp_summary_mintiue_sum.sum += 1;
			self.rtmp_summary_mintiue_sum.playerLoadTime += parseFloat(data.PlayerLoadTime);	
			self.rtmp_summary_mintiue_sum.data.push(data);	
			if(data.PlayStatus == 'success'){				
				self.rtmp_summary_mintiue_sum.successSum += 1;
			}	
		}

		if(data.PlayerLoadTime !== undefined  && data.ProtocolType == 'hls'){
			self.hls_summary_mintiue_sum.sum += 1;
			self.hls_summary_mintiue_sum.playerLoadTime += parseFloat(data.PlayerLoadTime);
			self.hls_summary_mintiue_sum.data.push(data);	
			if(data.PlayStatus == 'success'){				
				self.hls_summary_mintiue_sum.successSum += 1;
			}
		}	

		//每月的
		if(data.App && data.Stream && data.PlayerLoadTime !== undefined && data.ProtocolType == 'rtmp'){
			self.rtmp_summary_hour[data.App] = self.rtmp_summary_hour[data.App] || {};
			self.rtmp_summary_hour[data.App][data.Stream] = self.rtmp_summary_hour[data.App][data.Stream]  || {
				sum : 0,
				successSum : 0,
				PlayerLoadTime : 0
			};
			self.rtmp_summary_hour[data.App][data.Stream].sum += 1;
			self.rtmp_summary_hour[data.App][data.Stream].playerLoadTime += parseFloat(data.PlayerLoadTime);
			if(data.PlayStatus == 'success'){				
				self.rtmp_summary_hour[data.App][data.Stream].successSum += 1;
			}
		}
		if(data.App && data.Stream && data.PlayerLoadTime !== undefined && data.ProtocolType == 'hls'){
			self.hls_summary_hour[data.App] = self.hls_summary_hour[data.App] || {};
			self.hls_summary_hour[data.App][data.Stream] = self.hls_summary_hour[data.App][data.Stream]  || {
				sum : 0,
				successSum : 0,
				PlayerLoadTime : 0
			};
			self.hls_summary_hour[data.App][data.Stream].sum += 1;
			self.hls_summary_hour[data.App][data.Stream].playerLoadTime += parseFloat(data.PlayerLoadTime);
			if(data.PlayStatus == 'success'){				
				self.hls_summary_hour[data.App][data.Stream].successSum += 1;
			}
		}

		if(data.PlayerLoadTime !== undefined  && data.ProtocolType == 'rtmp'){			
			self.rtmp_summary_hour_sum.sum += 1;
			self.rtmp_summary_hour_sum.playerLoadTime += parseFloat(data.PlayerLoadTime);		
			if(data.PlayStatus == 'success'){				
				self.rtmp_summary_hour_sum.successSum += 1;
			}	
		}

		if(data.PlayerLoadTime !== undefined  && data.ProtocolType == 'hls'){			
			self.hls_summary_hour_sum.sum += 1;
			self.hls_summary_hour_sum.playerLoadTime += parseFloat(data.PlayerLoadTime);	
			if(data.PlayStatus == 'success'){				
				self.hls_summary_hour_sum.successSum += 1;
			}		
		}		
		
	};

	self.save_record = function(end_fun){	
		tools.save_json_to_dir('playerOld','rtmp_history_flu_summary',self.rtmp_history_flu_summary,function(){
			tools.save_json_to_dir('playerOld','hls_history_flu_summary',self.hls_history_flu_summary,function(){
				tools.save_json_to_dir('playerOld','rtmp_history_flu_summary_sum',self.rtmp_history_flu_summary_sum,function(){
					tools.save_json_to_dir('playerOld','hls_history_flu_summary_sum',self.hls_history_flu_summary_sum,function(){
						tools.save_json_to_dir('playerOld','rtmp_history_flu_summary_hour',self.rtmp_history_flu_summary_hour,function(){
							tools.save_json_to_dir('playerOld','hls_history_flu_summary_hour',self.hls_history_flu_summary_hour,function(){
								tools.save_json_to_dir('playerOld','rtmp_history_flu_summary_sum_hour',self.rtmp_history_flu_summary_sum_hour,function(){
									tools.save_json_to_dir('playerOld','hls_history_flu_summary_sum_hour',self.hls_history_flu_summary_sum_hour,function(){
										tools.save_json_to_dir('playerOld','rtmp_summary_hour',self.rtmp_summary_hour,function(){
											tools.save_json_to_dir('playerOld','hls_summary_hour',self.hls_summary_hour,function(){
												tools.save_json_to_dir('playerOld','rtmp_summary_hour_sum',self.rtmp_summary_hour_sum,function(){
													tools.save_json_to_dir('playerOld','hls_summary_hour_sum',self.hls_summary_hour_sum,end_fun);
												});
											});
										});
									});
								});
							});
						});
					});
				});	
			});
		});	
	};
	
	// var job_five = new cron("1 * * * * *",function(){self.save_record();},OnStop,true);
	// function OnStop(){
	// 	console.log("[Adycdn] OnStop",new Date());
	// };//每天保存一次数据

	self.init_record = function(){
		self.rtmp_history_flu_summary = tools.get_json_by_jsonflie('playerOld','rtmp_history_flu_summary') || {};//从文件中读取历史数据
		self.hls_history_flu_summary = tools.get_json_by_jsonflie('playerOld','hls_history_flu_summary') || {};//从文件中读取历史数据
		self.rtmp_history_flu_summary_sum = tools.get_json_by_jsonflie('playerOld','rtmp_history_flu_summary_sum') || [];
		self.hls_history_flu_summary_sum = tools.get_json_by_jsonflie('playerOld','hls_history_flu_summary_sum') || [];
		

		self.rtmp_summary_hour = tools.get_json_by_jsonflie('playerOld','rtmp_summary_hour') || {};
		self.hls_summary_hour = tools.get_json_by_jsonflie('playerOld','hls_summary_hour') || {};
		self.rtmp_summary_hour_sum = tools.get_json_by_jsonflie('playerOld','rtmp_summary_hour_sum') || {
			sum : 0,
			successSum: 0,
			playerLoadTime : 0
		};;
		self.hls_summary_hour_sum = tools.get_json_by_jsonflie('playerOld','hls_summary_hour_sum') || {
			sum : 0,
			successSum: 0,
			playerLoadTime : 0
		};

		self.rtmp_history_flu_summary_hour = tools.get_json_by_jsonflie('playerOld','rtmp_history_flu_summary_hour') || {};//从文件中读取历史数据
		self.hls_history_flu_summary_hour = tools.get_json_by_jsonflie('playerOld','hls_history_flu_summary_hour') || {};//从文件中读取历史数据
		self.rtmp_history_flu_summary_sum_hour = tools.get_json_by_jsonflie('playerOld','rtmp_history_flu_summary_sum_hour') || [];
		self.hls_history_flu_summary_sum_hour = tools.get_json_by_jsonflie('playerOld','hls_history_flu_summary_sum_hour') || [];
		
		setInterval(function(){	
			var deletNum =  60*24;//24小时
			self.add_history_for_time(SUMMARY_TYPE.MINUTE,DATA_TYPE.HLS,SUMMARY_SEARCH.STREAM,deletNum);
			self.add_history_for_time(SUMMARY_TYPE.MINUTE,DATA_TYPE.RTMP,SUMMARY_SEARCH.STREAM,deletNum);
			self.add_history_for_time(SUMMARY_TYPE.MINUTE,DATA_TYPE.HLS,SUMMARY_SEARCH.ALL,deletNum);
			self.add_history_for_time(SUMMARY_TYPE.MINUTE,DATA_TYPE.RTMP,SUMMARY_SEARCH.ALL,deletNum);
			
			self.lastminitue_rtmp_summary_minitue = cloneObj(self.rtmp_summary_minitue);
			self.lastminitue_hls_summary_minitue = cloneObj(self.hls_summary_minitue);


			self.rtmp_summary_minitue = {};
			self.hls_summary_minitue = {};
			self.rtmp_summary_mintiue_sum = {
				sum : 0,
				successSum: 0,
				playerLoadTime : 0,
				data:[]
			};
			self.hls_summary_mintiue_sum = {
				sum : 0,
				successSum: 0,
				playerLoadTime : 0,
				data:[]
			};

			if(tools.curr_time("HH:mm") === "02:00"){
				var deletNum = 30;//30天
				self.add_history_for_time(SUMMARY_TYPE.HOUR,DATA_TYPE.HLS,SUMMARY_SEARCH.STREAM,deletNum);
				self.add_history_for_time(SUMMARY_TYPE.HOUR,DATA_TYPE.RTMP,SUMMARY_SEARCH.STREAM,deletNum);
				self.add_history_for_time(SUMMARY_TYPE.HOUR,DATA_TYPE.HLS,SUMMARY_SEARCH.ALL,deletNum);
				self.add_history_for_time(SUMMARY_TYPE.HOUR,DATA_TYPE.RTMP,SUMMARY_SEARCH.ALL,deletNum);
			
				self.rtmp_summary_hour = {};
				self.hls_summary_hour = {};
				self.rtmp_summary_hour_sum = {
					sum : 0,
					successSum: 0,
					playerLoadTime : 0
				};
				self.hls_summary_hour_sum = {
					sum : 0,
					successSum: 0,
					playerLoadTime : 0
				};

				self.save_record(function(){
					log.info('save_record success');
				});
			}
		},MINUTE);

	};

	self.add_history_for_time = function(t,d_t,s_t,deletNum){		
		var deletNum = deletNum;	
		if(s_t == SUMMARY_SEARCH.STREAM){
			if(t == SUMMARY_TYPE.MINUTE ){
				if(d_t == DATA_TYPE.RTMP){
					var para = self.rtmp_summary_minitue;
					var one = self.rtmp_history_flu_summary;
				}else{
					var para = self.hls_summary_minitue;
					var one = self.hls_history_flu_summary;
				}
			}
			else if(t == SUMMARY_TYPE.HOUR){
				if(d_t == DATA_TYPE.RTMP){
					var para = self.rtmp_summary_hour;
					var one = self.rtmp_history_flu_summary_hour;
				}else{
					var para = self.hls_summary_hour;
					var one = self.hls_history_flu_summary_hour;
				}
			}			
			for(var app in para){
				for(var stream in para[app]){
					var tmp = para[app][stream];

					one[app] = one[app] || {};
					one[app][stream] = one[app][stream] || {
						times:[],
						playerLoadTime:[],
						sum:[],
						successSum:[]
					};
					while(one[app][stream].times.length > deletNum){//超过48小时,从数组头去掉超出的数据
						one[app][stream].times.shift();
						one[app][stream].playerLoadTime.shift();
						one[app][stream].sum.shift();
						one[app][stream].successSum.shift();
					}
					
					one[app][stream].times.push(new Date().getTime());
					one[app][stream].playerLoadTime.push(tmp.sum === 0 ? 0 : parseFloat((tmp.playerLoadTime / tmp.sum /1000).toFixed(2)) );
					one[app][stream].successSum.push(tmp.sum === 0 ? 100 : parseFloat((tmp.successSum / tmp.sum).toFixed(2)) * 100);
					one[app][stream].sum.push(tmp.sum);	
				}
			}

			for(var app in one){
				for(var stream in one[app]){
					if(!para[app] || !para[app][stream]){
						while(one[app][stream].times.length > deletNum){//超过48小时,从数组头去掉超出的数据
							one[app][stream].times.shift();
							one[app][stream].playerLoadTime.shift();
							one[app][stream].sum.shift();
							one[app][stream].successSum.shift();	
						}
					
						one[app][stream].times.push(new Date().getTime());
						one[app][stream].playerLoadTime.push(0);
						one[app][stream].sum.push(0);
						one[app][stream].successSum.push(0);	
					}
				}
			}
		}
		else{	
			if(t == SUMMARY_TYPE.MINUTE ){
				if(d_t == DATA_TYPE.RTMP){
					var para = self.rtmp_summary_mintiue_sum;
					var one = self.rtmp_history_flu_summary_sum;
				}else{
					var para = self.hls_summary_mintiue_sum;
					var one = self.hls_history_flu_summary_sum;
				}
			}	
			else if(t == SUMMARY_TYPE.HOUR){
				if(d_t == DATA_TYPE.RTMP){
					var para = self.rtmp_summary_hour_sum;
					var one = self.rtmp_history_flu_summary_sum_hour;
				}else{
					var para = self.hls_summary_hour_sum;
					var one = self.hls_history_flu_summary_sum_hour;
				}
			}	
			//sum			
			one.push({
				time : new Date().getTime(),
				playerLoadTime : para.sum === 0 ? 0 : (parseFloat((para.playerLoadTime / para.sum / 1000).toFixed(2)) ),
				sum : para.sum,
				successSum :  para.sum === 0 ? 100 : (parseFloat((para.successSum / para.sum).toFixed(2)) * 100),
			
			});
	
			while(one.length > deletNum){//超过24小时,从数组头去掉超出的数据
				one.shift();
			}
		}
	
	};

	self.get_rtmp_fluency_record = function(start,end){	
		return self.get_fluency_record(SUMMARY_TYPE.MINUTE,DATA_TYPE.RTMP,start,end);
	};
	self.get_hls_fluency_record = function(start,end){	
		return self.get_fluency_record(SUMMARY_TYPE.MINUTE,DATA_TYPE.HLS,start,end);
	};
	self.get_rtmp_fluency_record_hour = function(start,end){	
		return self.get_fluency_record(SUMMARY_TYPE.HOUR,DATA_TYPE.RTMP,start,end);
	};
	self.get_hls_fluency_record_hour = function(start,end){	
		return self.get_fluency_record(SUMMARY_TYPE.HOUR,DATA_TYPE.HLS,start,end);
	};
	
	self.get_fluency_record = function(t ,d_t ,start,end){
		if(t == SUMMARY_TYPE.MINUTE ){
			if(d_t == DATA_TYPE.RTMP){
				var his = self.rtmp_history_flu_summary_sum || [];
			}else{
				var his = self.hls_history_flu_summary_sum || [];
			}
		}	
		else if(t == SUMMARY_TYPE.HOUR){
			if(d_t == DATA_TYPE.RTMP){
				var his = self.rtmp_history_flu_summary_sum_hour || [];
			}else{
				var his = self.hls_history_flu_summary_sum_hour || []
			}
		}
		var record = {
			times : [],
			playerLoadTime : [],
			sum : [],
			successSum : []
		};
		if(!start && !end){
			for(var i in his){
				var one = his[i];
				var tmp_time = new Date(one.time).pattern("yyyy-MM-dd HH:mm:ss");
				record.times.push(tmp_time);
				record.playerLoadTime.push(one.playerLoadTime);
				record.sum.push(one.sum);
				record.successSum.push(one.successSum);
			}
			return record;
		}
		for(var i in his){
			var one = his[i];
			for(var j in one[i]){
				var cur  = one[i][j];
				
				var tmp_time = new Date(cur.time).pattern("yyyy-MM-dd HH:mm:ss");
				if(start && end){
					if(cur.time >= start && cur.time <= end){
						record.times.push(tmp_time);
						record.playerLoadTime.push(cur.data);
						record.sum.push(cur.sum);
						record.successSum.push(cur.successSum);
					}
				}else if(start && !end){
					if(cur.time >= start){
						record.times.push(tmp_time);
						record.playerLoadTime.push(cur.data);
						record.sum.push(cur.sum);
						record.successSum.push(cur.successSum);
					}
				}else if(!start && end){
					if(cur.time <= end){
						record.times.push(tmp_time);
						record.playerLoadTime.push(cur.data);
						record.sum.push(cur.sum);
						record.successSum.push(cur.successSum);
					}
				}

			}
			
			
		}
		return record;
	}


	self.get_rtmp_flu_record_for_app_stream = function(app,stream,start,end){
		
		return self.get_flu_record_for_app_stream(SUMMARY_TYPE.MINUTE,DATA_TYPE.RTMP,app,stream,start,end);
	};
	self.get_hls_flu_record_for_app_stream = function(app,stream,start,end){
		
		return self.get_flu_record_for_app_stream(SUMMARY_TYPE.MINUTE,DATA_TYPE.HLS,app,stream,start,end);
	};
	self.get_rtmp_flu_record_for_app_stream_hour = function(app,stream,start,end){
		
		return self.get_flu_record_for_app_stream(SUMMARY_TYPE.HOUR,DATA_TYPE.RTMP,app,stream,start,end);
	};
	self.get_hls_flu_record_for_app_stream_hour = function(app,stream,start,end){
		
		return self.get_flu_record_for_app_stream(SUMMARY_TYPE.HOUR,DATA_TYPE.HLS,app,stream,start,end);
	};
	self.get_flu_record_for_app_stream = function(t,d_t,app,stream,start,end){
		if(t == SUMMARY_TYPE.MINUTE ){
			if(d_t == DATA_TYPE.RTMP){
				var his = self.rtmp_history_flu_summary;
			}else{
				var his = self.hls_history_flu_summary;
			}
		}
		else if(t == SUMMARY_TYPE.HOUR){
			if(d_t == DATA_TYPE.RTMP){
				var his = self.rtmp_history_flu_summary_hour;
			}else{
				var his = self.hls_history_flu_summary_hour;
			}
		}	

		var res = {
			times:[],
			playerLoadTime :[],
			sum : [],
			successSum: []
		};
		if(his[app] && his[app][stream]){		
			var data = his[app][stream];		
			if(!start && !end){
				for(var i = 0 ;i < data.times.length;++i){			
					var tmp_time = new Date(data.times[i]).pattern("yyyy-MM-dd HH:mm:ss");
					res.times.push(tmp_time);
					res.playerLoadTime.push(data.playerLoadTime[i]);
					res.sum.push(data.sum[i]);
					res.successSum.push(data.successSum[i]);
				}
				return res;
			}

			for(var i = 0 ;i < data.times.length;++i){				
				var tmp_time = new Date(data.times[i]).pattern("yyyy-MM-dd HH:mm:ss");
				//根据时间筛选				
				 if(start && end){
					if(data.times[i] >= start && data.times[i] <= end){
						res.times.push(tmp_time);
						res.playerLoadTime.push(data.playerLoadTime[i]);						
						res.sum.push(data.sum[i]);
						res.successSum.push(data.successSum[i]);
					}
				}else if(start && !end){
					if(data.times[i] >= start){
						res.times.push(tmp_time);
						res.playerLoadTime.push(data.playerLoadTime[i]);						
						res.sum.push(data.sum[i]);
						res.successSum.push(data.successSum[i]);
					}
				}else if(!start && end){
					if(data.times[i] <= end){
						res.times.push(tmp_time);
						res.playerLoadTime.push(data.playerLoadTime[i]);						
						res.sum.push(data.sum[i]);
						res.successSum.push(data.successSum[i]);
					}
				}
			}

			return res;
		}
		return res;
	};


	self.get_rtmp_flu_range_for_app_stream_minitue = function(){
		var para = self.lastminitue_rtmp_summary_minitue;
		var array = getArrayForMinitue(para);
		return array.sort(compare('PlayerLoadTime'));
	}
	self.get_hls_flu_range_for_app_stream_minitue = function(){
		var para = self.lastminitue_hls_summary_minitue;
	
		var array = getArrayForMinitue(para);
		return array.sort(compare('PlayerLoadTime'));
	}
	function getArrayForMinitue(para){
		var array = [];
	
		for(var app in para){
			for(var stream in para[app]){
				var tmp = para[app][stream];
				var time = new Date().getTime();
				var playerLoadTime = tmp.sum === 0 ? 0 : parseFloat((tmp.playerLoadTime / tmp.sum / 1000).toFixed(2)) ;
				var successSum = tmp.sum === 0 ? 0 : parseFloat((tmp.successSum / tmp.sum).toFixed(2)) ;

				var data = tmp.data;
				var sum = tmp.sum ;

				array.push({playerLoadTime:playerLoadTime,successSum:successSum,data:data,time:time,sum:sum});
			}
		}

		return array;
	}
	//快速排序
	function compare(property){
		 return function(a,b){
			var value1 = a[property];
			var value2 = b[property];
			return value1 - value2;
		}
			
	}
	//深拷贝
	var cloneObj = function(obj){
		var o = obj instanceof Array ? [] : {};
		for(var k in obj) 
			o[k] = typeof obj[k] === Object ? deepClone(obj[k]) : obj[k];
		return o;
	};
};

exports.New = function(config){
	return new playerSummary(config);
};