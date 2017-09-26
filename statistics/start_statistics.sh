while [ true ]; do
	mkdir -p Log
	nohup ./node_v8.4.0_x64 --max-old-space-size=4096 statistics_main.js  &> Log/`date +%Y-%m-%d-%H-%M-%S`'.out' &
	wait
	sleep 2
done
