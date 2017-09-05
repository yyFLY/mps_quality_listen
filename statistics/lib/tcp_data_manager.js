var TcpCmdSendReceiveManager = function(socket) {
    this.remainData = new Buffer(0);		//剩下的数据
    this.dataOffset = 0;					//有效数据偏移量
    
    this.endMark = new Buffer(1);
    this.endMark[0] = 0xff;

    this.BufferList = [];

   if (socket) {
   		this.Socket = socket;
		this.remoteID = "[" + socket.remoteAddress +":"+ socket.remotePort+"]";
	}else{
		this.Socket = null;
		this.remoteID = "UnKnow";
	}	
};

TcpCmdSendReceiveManager.prototype.IsValidSocket = function(){
	return (this.Socket && this.Socket['readable']) && this.Socket['writable'];
};

TcpCmdSendReceiveManager.prototype.SetSocket = function(socket){
	if (!socket) {
		console.log("Invalid argument socket");
		return false;
	};
	// if (this.Socket) {
	// 	this.Socket.end()
	// 	console.log("Invalid socket");
	// 	return false;
	// };
	this.Socket = socket;
	this.remoteID = "[" + socket.remoteAddress +":"+ socket.remotePort+"]";
}
TcpCmdSendReceiveManager.prototype.ReSet = function(){
	//console.log("reset:"+this.remainData);
	this.remainData = new Buffer(0);
    this.dataOffset = 0;
    this.endMark = new Buffer(1);
    this.endMark[0] = 0xff;

    this.BufferList = [];
}
//接收到数据
TcpCmdSendReceiveManager.prototype.ReceiveData = function(data) {

	//console.log( "ReceiveData ..." + data );
	//console.log( "ReceiveData ..." + data.toString('utf8') );
			
	if ( data.length <= 0 ) 
	{
		return;
	}
	
	/*
	console.log( "TcpCmdSendReceiveManager.prototype.ReceiveData" );
	console.log( this.remainData );
	console.log( this.remainData.length );
	console.log( this.dataOffset );
	*/
	var remainDataLen = this.remainData.length - this.dataOffset;
	var newBuf = new Buffer( data.length + remainDataLen );
	
	//console.log( remainDataLen );
	var targetStart = 0;
	if ( remainDataLen > 0 ) 
	{
		this.remainData.copy(newBuf, targetStart, this.dataOffset, this.remainData.length);
		targetStart += remainDataLen;
	}
	this.dataOffset = 0;
	
	//console.log( targetStart );
	data.copy(newBuf, targetStart, 0, data.length);
	
	this.remainData = newBuf;
	//console.log( this.remainData );
	//console.log( this.remainData.length );
	//console.log( this.dataOffset );
	
	//console.log( "remainData ..." + this.remainData );
	//console.log( "remainData ..." + this.remainData.toString('utf8') );
}

//获取命令字符串
TcpCmdSendReceiveManager.prototype.GetCmdString = function() {

	if ( this.remainData.length <= 0 ) 
	{
		return false;
	}
	
	if (  this.dataOffset >= this.remainData.length ) 
	{
		this.remainData = new Buffer(0);
		this.dataOffset = 0;
		return false;
	}
	
    // Find the first instance of 0xff, our terminating byte
    for (var i = this.dataOffset; i < this.remainData.length && this.remainData[i] != 0x0; i++)
        ;
        
	//console.log( this.remainData.toString('ascii', this.dataOffset) );
	//console.log( i );

    // We didn't find a terminating byte
    if (i >= this.remainData.length) 
    {
        return false;
    }
	
	var startPos = this.dataOffset;
	this.dataOffset = i + 1;
	var cmdBuf = this.remainData.slice(startPos, i);
	
	// console.log( "cmdBuf ..." + cmdBuf.toString('utf8') );
	// console.log( "remainData ..." + this.remainData );
	// console.log( "remainData ..." + this.remainData.toString('utf8') );
	
	return cmdBuf.toString('utf8', 0, cmdBuf.length);
}

TcpCmdSendReceiveManager.prototype.WriteData = function(data){
	//console.log(this.remoteID + "WriteData ##" + data);
	if (data.length > 0) {
		this.BufferList.push(data);
		return this.SendData();
	}
	else{
		console.log("Invalid length:"+ data.length);
		return false;
	}
}


//发送数据, 以0x0结尾
TcpCmdSendReceiveManager.prototype.SendData = function() {
	if ( !(this.Socket && this.Socket.writable) )
	{
		console.log("Invalid Socket :" + this.Socket);
		if (this.Socket) {
			console.log("socket writable :" + this.Socket.writable);
		};
		return false;
	}

	while(this.BufferList.length > 0)
	{
		if(this.Socket.write(this.BufferList[0] + '\0'))
		{
			this.BufferList.shift();
		}
		else
		{
			console.log("write failed  msg:"+this.BufferList[0]);
			break;
		}
	}
	return true;
}

exports.New = function(socket){
	return new TcpCmdSendReceiveManager(socket);
};