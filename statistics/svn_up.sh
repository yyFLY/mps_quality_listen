
#!/bin/sh

if [ $# -eq 0 ]; then
	svn up --username xzl --password "x)#Lz%iw^"
elif [ $# -eq 1 ]; then
	svn up -r $1 --username xzl --password "x)#Lz%iw^"
else
	echo "svn up parms count invaild"
fi

chmod -R 755 ./*.sh