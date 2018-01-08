var io = require('socket.io')();
var baseDb  = require('./baseDbConfig').connect();
var socketArr = [];
io.on('connection', function (_socket) {
    console.log(_socket.id + ': connection');
   
    _socket.on('sendName',function(name){
    	var param = {
    		socket: _socket,
    		name: name
    	};
    	var currentIndex;
    	for(var i=0;i<socketArr.length;i++) {
    		if(socketArr[i].name == name){
    			currentIndex = i;
    			
    		}
    	}
    	if(currentIndex !== undefined){
    		socketArr[currentIndex] = param;
    	}else{
    		socketArr.push(param)
    	}
   console.log(socketArr.length+'-----length')
    })
    //登录后加入房间
    _socket.on('joinRoom',function(userName){
    	io.sockets.emit("toallmsg",userName);
    });
   
   //获取在线人员列表
   	getOnlineList();
   	
   	//获取在线人员列表
	 _socket.on('getPersonList',function(){
    	getOnlineList();
    })
	//公众发言
	_socket.on('saytoall',function(userName,content,path,time){
		console.log('saytoall'+content)
		io.sockets.emit("sendtoall",userName,content,path,time);
	});
	
	//公众发送图片
	 _socket.on('sendImgPublic', function(url,name,path,time) {   
        io.sockets.emit('receiveImgPublic', url,name,path,time);  
    });  
	//私聊某人
	_socket.on('saytosomebody',function(from,to,content,time,callack){
		console.log(from,to,content,time)
		var toObj = socketArr.filter(function(item,index){
			return item.name == to;
		});
		var fromObj = socketArr.filter(function(item,index){
			return item.name == from;
		});
		if(toObj.length > 0) {
			toObj[0].socket.emit('saytosomebody_to_'+ to, from,content,time);//接受的一方		
		}
		if(fromObj.length>0) {
			fromObj[0].socket.emit('saytosomebody_from_'+ from, to,content,time);//发出的一方
		}
	})
	
	//私聊发送图片
	_socket.on('sendImgPrivate',function(from,to,url,time,callack){
		console.log(from,to,url,time)
		var toObj = socketArr.filter(function(item,index){
			return item.name == to;
		});
		var fromObj = socketArr.filter(function(item,index){
			return item.name == from;
		});
		if(toObj.length > 0) {
			toObj[0].socket.emit('receiveImgPrivate_to_'+ to, from,url,time);//接受的一方		
		}
		if(fromObj.length>0) {
			fromObj[0].socket.emit('receiveImgPrivate_from_'+ from, to,url,time);//发出的一方
		}
	})
	
	//修改名字后系统消息
	_socket.on('changeInfo',function(oldName,newName,fn){
    	io.sockets.emit("changeInfoMsg",oldName,newName);
    	fn();
    });
	//断线后注销
	_socket.on('disconnect',function(){
		let name;
		let index;
		for(var i=0;i<socketArr.length;i++) {
			if(socketArr[i].socket.id == _socket.id){
				name = socketArr[i].name;
				index = i;
				break;
			}
		}
		setStatusDown(name,index);
	})
});

function getOnlineList(){
	baseDb.query('select * from user where status="up"',function(err,data){
		if(err){
			console.log(err.stack)
		}else{
			io.sockets.emit("sendPersonList",data);
		}
	});
}

function setStatusDown(name,index){
	baseDb.query('update user set status="down" where name="'+name+'"',function(err,data){
		if(err){
			console.log(err.stack)
		}else{
			socketArr.splice(index,1);
			io.sockets.emit("saybyetoall",name);
			getOnlineList();
		}
	});
}

exports.listen = function (_server) {
    return io.listen(_server);
};