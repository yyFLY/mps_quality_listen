while [ true ]; do
	mkdir -p Log
	nohup ./node_x64_v0.10.32 --max-old-space-size=4096 statistics_main.js  &> Log/`date +%Y-%m-%d-%H-%M-%S`'.out' &
	wait
	sleep 2
done