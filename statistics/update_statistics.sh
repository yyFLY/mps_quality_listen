#!/bin/sh

b_rm=0
if [ $# -gt 0 ]; then
    b_rm=$1
fi

#if [ $# -gt 1 ]; then
#    svn up -r $2 --username xzl --password "x)#Lz%iw^"
#    echo "svn version:$2"
#else
#	svn up --username xzl --password "x)#Lz%iw^"
#fi

pid=`ps -ef|grep -i statistics_main.js |grep -v "grep"|awk '{print $2}'`
echo "ctl pid:$pid,rm:$b_rm"

if [ $b_rm -eq 1 ]; then
    rm -rf Log
fi

kill -9  $pid
