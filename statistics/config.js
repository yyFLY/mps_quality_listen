exports.config = {
	http : {
		port : 8080
	},
	mq : {
		mq_host : "mqmps.aodianyun.com",
		mq_port : 5142,
		topic : "Mps_FluencyInfo",
		partition : [0,1,2,3,4],
		subKey : "",
		maxSize : 800*1024
	},
	html_path : '../html',
	status_threshold : {
		max_cpu : 60,
		max_in_mb : 5,
		max_out_mb : 5,
		max_http_reqs : 1000
	}
};
