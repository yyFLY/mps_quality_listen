

var summary = function(){
	var self = this;
		
	self.rtmp_summary_minitue = {
			// "app" : {
			// 	"stream" : {
			// 		sum : 0,
			// 		fluency : 0
			// 	}
			// }
	}//统计每分钟rtmp的流畅度 按app stream查询
	self.rtmp_history_flu_summary = {	// "appname":{
		// 	"streamname":{
		// 		times :[123,4234],
		// 		flu :[100,100]
		// 	}
		// }
	};
	
	self.hls_summary_minitue = {}//统计每分钟hls的流畅度 按app stream查询
	self.hls_history_flu_summary = {};

	self.rtmp_summary_mintiue_sum = {
		sum : 0,
		flu : 0	
	};
	self.rtmp_history_flu_summary_sum = [
		// {
		// 	time : new Date().getTime(),
		// 	flu : 0
		// }
	];
	

	self.hls_summary_mintiue_sum = {
		sum : 0,
		flu : 0	
	};
	self.hls_history_flu_summary_sum = [];


	//近30日的
	self.rtmp_summary_hour = {
	}
	self.rtmp_history_flu_summary_hour = {};
	
	self.hls_summary_hour = {}
	self.hls_history_flu_summary_hour = {};
	self.rtmp_summary_hour_sum = {
		sum : 0,
		flu : 0	
	};
	self.rtmp_history_flu_summary_sum_hour = [];
	self.hls_summary_hour_sum = {
		sum : 0,
		flu : 0	
	};
	self.hls_history_flu_summary_sum_hour = [];

	self.dealAll = function(data){
		if(data.App && data.Stream && data.Fluency !== undefined && data.ProtocolType == 'rtmp'){
			self.rtmp_summary_minitue[data.App] = self.rtmp_summary_minitue[data.App] || {};
			self.rtmp_summary_minitue[data.App][data.Stream] = self.rtmp_summary_minitue[data.App][data.Stream]  || {
				sum : 0,
				flu : 0
			};
			self.rtmp_summary_minitue[data.App][data.Stream].sum += 1;
			self.rtmp_summary_minitue[data.App][data.Stream].flu += parseFloat(data.Fluency);
		}
		if(data.App && data.Stream && data.Fluency !== undefined && data.ProtocolType == 'hls'){
			self.hls_summary_minitue[data.App] = self.hls_summary_minitue[data.App] || {};
			self.hls_summary_minitue[data.App][data.Stream] = self.hls_summary_minitue[data.App][data.Stream]  || {
				sum : 0,
				flu : 0
			};
			self.hls_summary_minitue[data.App][data.Stream].sum += 1;
			self.hls_summary_minitue[data.App][data.Stream].flu += parseFloat(data.Fluency);
		}

		if(data.Fluency !== undefined  && data.ProtocolType == 'rtmp'){			
			self.rtmp_summary_mintiue_sum.sum += 1;
			self.rtmp_summary_mintiue_sum.flu += parseFloat(data.Fluency);
		}

		if(data.Fluency !== undefined  && data.ProtocolType == 'hls'){			
			self.hls_summary_mintiue_sum.sum += 1;
			self.hls_summary_mintiue_sum.flu += parseFloat(data.Fluency);
		}	

		//每月的

		if(data.App && data.Stream && data.Fluency !== undefined && data.ProtocolType == 'rtmp'){
			self.rtmp_summary_hour[data.App] = self.rtmp_summary_hour[data.App] || {};
			self.rtmp_summary_hour[data.App][data.Stream] = self.rtmp_summary_hour[data.App][data.Stream]  || {
				sum : 0,
				flu : 0
			};
			self.rtmp_summary_hour[data.App][data.Stream].sum += 1;
			self.rtmp_summary_hour[data.App][data.Stream].flu += parseFloat(data.Fluency);
		}
		if(data.App && data.Stream && data.Fluency !== undefined && data.ProtocolType == 'hls'){
			self.hls_summary_hour[data.App] = self.hls_summary_hour[data.App] || {};
			self.hls_summary_hour[data.App][data.Stream] = self.hls_summary_hour[data.App][data.Stream]  || {
				sum : 0,
				flu : 0
			};
			self.hls_summary_hour[data.App][data.Stream].sum += 1;
			self.hls_summary_hour[data.App][data.Stream].flu += parseFloat(data.Fluency);
		}

		if(data.Fluency !== undefined  && data.ProtocolType == 'rtmp'){			
			self.rtmp_summary_hour_sum.sum += 1;
			self.rtmp_summary_hour_sum.flu += parseFloat(data.Fluency);
		}

		if(data.Fluency !== undefined  && data.ProtocolType == 'hls'){			
			self.hls_summary_hour_sum.sum += 1;
			self.hls_summary_hour_sum.flu += parseFloat(data.Fluency);
		}		
		
	}


	self.save_record = function(end_fun){	
		tools.save_json_to_dir('old','rtmp_history_flu_summary',self.rtmp_history_flu_summary,end_fun);	
		tools.save_json_to_dir('old','hls_history_flu_summary',self.hls_history_flu_summary,end_fun);
		tools.save_json_to_dir('old','rtmp_history_flu_summary_sum',self.rtmp_history_flu_summary_sum);	
		tools.save_json_to_dir('old','hls_history_flu_summary_sum',self.hls_history_flu_summary_sum);

		tools.save_json_to_dir('old','rtmp_history_flu_summary_hour',self.rtmp_history_flu_summary_hour,end_fun);	
		tools.save_json_to_dir('old','hls_history_flu_summary_hour',self.hls_history_flu_summary_hour,end_fun);
		tools.save_json_to_dir('old','rtmp_history_flu_summary_sum_hour',self.rtmp_history_flu_summary_sum_hour);	
		tools.save_json_to_dir('old','hls_history_flu_summary_sum_hour',self.hls_history_flu_summary_sum_hour);
	};

	self.init_record = function(){
		self.rtmp_history_flu_summary = tools.get_json_by_jsonflie('old','rtmp_history_flu_summary') || {};//从文件中读取历史数据
		self.hls_history_flu_summary = tools.get_json_by_jsonflie('old','hls_history_flu_summary') || {};//从文件中读取历史数据
		self.rtmp_history_flu_summary_sum = tools.get_json_by_jsonflie('old','rtmp_history_flu_summary_sum') || [];
		self.hls_history_flu_summary_sum = tools.get_json_by_jsonflie('old','hls_history_flu_summary_sum') || [];
		

		self.rtmp_history_flu_summary_hour = tools.get_json_by_jsonflie('old','rtmp_history_flu_summary_hour') || {};//从文件中读取历史数据
		self.hls_history_flu_summary_hour = tools.get_json_by_jsonflie('old','hls_history_flu_summary_hour') || {};//从文件中读取历史数据
		self.rtmp_history_flu_summary_sum_hour = tools.get_json_by_jsonflie('old','rtmp_history_flu_summary_sum_hour') || [];
		self.hls_history_flu_summary_sum_hour = tools.get_json_by_jsonflie('old','hls_history_flu_summary_sum_hour') || [];
	
		
		setInterval(function(){	
			var deletNum =  60*60*24;//24小时
			self.rtmp_history_flu_summary = getHistory(self.rtmp_summary_minitue,self.rtmp_history_flu_summary,deletNum);
			self.hls_history_flu_summary = getHistory(self.hls_summary_minitue,self.hls_history_flu_summary,deletNum);
			self.rtmp_history_flu_summary_sum = getAllHistory(self.rtmp_summary_mintiue_sum,self.rtmp_history_flu_summary_sum,deletNum);
			self.hls_history_flu_summary_sum = getAllHistory(self.hls_summary_mintiue_sum,self.hls_history_flu_summary_sum,deletNum);

			self.rtmp_summary_minitue = {};
			self.hls_summary_minitue = {};
			self.rtmp_summary_mintiue_sum = {
					sum : 0,
					flu : 0	
			};
			self.hls_summary_mintiue_sum = {
					sum : 0,
					flu : 0	
			};
			
		},60*1000);	

		setInterval(function(){	
			var deletNum =  60*60*24*30;//30天
			self.rtmp_history_flu_summary_hour = getHistory(self.rtmp_summary_hour,self.rtmp_history_flu_summary_hour,deletNum);
			self.hls_history_flu_summary_hour = getHistory(self.hls_summary_hour,self.hls_history_flu_summary_hour,deletNum);
			self.rtmp_history_flu_summary_sum_hour = getAllHistory(self.rtmp_summary_hour_sum,self.rtmp_history_flu_summary_sum_hour,deletNum);
			self.hls_history_flu_summary_sum_hour = getAllHistory(self.hls_summary_hour_sum,self.hls_history_flu_summary_sum_hour,deletNum);


			self.rtmp_summary_hour = {};
			self.hls_summary_hour = {};
			self.rtmp_summary_hour_sum = {
					sum : 0,
					flu : 0	
			};
			self.hls_summary_hour_sum = {
					sum : 0,
					flu : 0	
			};
			
		},24*60*60*1000);			
		
		function getHistory(para,his,deletNum){
			var para = para;
			var one = his;			
			for(var app in para){
				for(var stream in para[app]){
					var tmp = para[app][stream];

					one[app] = one[app] || {};
					one[app][stream] = one[app][stream] || {
						times:[],
						flu:[]
					};
					while(one[app][stream].times.length > deletNum){//超过48小时,从数组头去掉超出的数据
						
						one[app][stream].times.shift();
						one[app][stream].flu.shift();
					}
					
					one[app][stream].times.push(new Date().getTime());
					one[app][stream].flu.push(tmp.sum === 0 ? 0 : parseFloat((tmp.flu / tmp.sum).toFixed(2)) * 100);
							
				}
			}

			for(var app in one){
				for(var stream in one[app]){
					if(!para[app] || !para[app][stream]){
					while(one[app][stream].times.length > deletNum){//超过48小时,从数组头去掉超出的数据
						
						one[app][stream].times.shift();
						one[app][stream].flu.shift();
					}
					
						one[app][stream].times.push(new Date().getTime());
						one[app][stream].flu.push(0);
					}
				}
			}
			return one;
		}

		function getAllHistory(para,his,deletNum){
			var para = para;
			var one = his || [];
			//sum			
			one.push({
				time : new Date().getTime(),
				flu : para.sum === 0 ? 0 : (parseFloat((para.flu / para.sum).toFixed(2)) * 100)
			});
	
			while(one.length > deletNum){//超过24小时,从数组头去掉超出的数据
				one.shift();
			}
			return one;
		}
	};

	self.get_rtmp_fluency_record = function(start,end){	
		return self.get_fluency_record(self.rtmp_history_flu_summary_sum,start,end);
	};
	self.get_hls_fluency_record = function(start,end){	
		return self.get_fluency_record(self.hls_history_flu_summary_sum,start,end);
	};
	self.get_rtmp_fluency_record_hour = function(start,end){	
		return self.get_fluency_record(self.rtmp_history_flu_summary_sum_hour,start,end);
	};
	self.get_hls_fluency_record_hour = function(start,end){	
		return self.get_fluency_record(self.hls_history_flu_summary_sum_hour,start,end);
	};
	self.get_fluency_record = function(his,start,end){
		var record = {
			times : [],
			flu : []
		};
		if(!start && !end){
			for(var i in his){
				var one = his[i];
				var tmp_time = new Date(one.time).pattern("yyyy-MM-dd HH:mm:ss");
				record.times.push(tmp_time);
				record.flu.push(one.flu);
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
						record.flu.push(cur.data);
					}
				}else if(start && !end){
					if(cur.time >= start){
						record.times.push(tmp_time);
						record.flu.push(cur.data);
					}
				}else if(!start && end){
					if(cur.time <= end){
						record.times.push(tmp_time);
						record.flu.push(cur.data);
					}
				}

			}
			
			
		}
		return record;
	}


	self.get_rtmp_flu_record_for_app_stream = function(app,stream,start,end){
		
		return self.get_flu_record_for_app_stream(self.rtmp_history_flu_summary,app,stream,start,end);
	};
	self.get_hls_flu_record_for_app_stream = function(app,stream,start,end){
		
		return self.get_flu_record_for_app_stream(self.hls_history_flu_summary,app,stream,start,end);
	};
	self.get_rtmp_flu_record_for_app_stream_hour = function(app,stream,start,end){
		
		return self.get_flu_record_for_app_stream(self.rtmp_history_flu_summary_hour,app,stream,start,end);
	};
	self.get_hls_flu_record_for_app_stream_hour = function(app,stream,start,end){
		
		return self.get_flu_record_for_app_stream(self.hls_history_flu_summary_hour,app,stream,start,end);
	};
	self.get_flu_record_for_app_stream = function(his,app,stream,start,end){
		var res = {
			times:[],
			flu :[]
		};
		if(his[app] && his[app][stream]){		
			var data = his[app][stream];		
			if(!start && !end){
				for(var i = 0 ;i < data.times.length;++i){			
					var tmp_time = new Date(data.times[i]).pattern("yyyy-MM-dd HH:mm:ss");
					res.times.push(tmp_time);
					res.flu.push(data.flu[i]);
				}
				return res;
			}

			for(var i = 0 ;i < data.times.length;++i){				
				var tmp_time = new Date(data.times[i]).pattern("yyyy-MM-dd HH:mm:ss");
				//根据时间筛选				
				 if(start && end){
					if(data.times[i] >= start && data.times[i] <= end){
						res.times.push(tmp_time);
						res.flu.push(data.flu[i]);
					}
				}else if(start && !end){
					if(data.times[i] >= start){
						res.times.push(tmp_time);
						res.flu.push(data.flu[i]);
					}
				}else if(!start && end){
					if(data.times[i] <= end){
						res.times.push(tmp_time);
						res.flu.push(data.flu[i]);
					}
				}
			}

			return res;
		}
		return res;
	};
};

exports.New = function(){
	return new summary();
};