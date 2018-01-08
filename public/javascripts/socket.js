
	function initSocket(){
		global_socket = io.connect('http://localhost:3000');
		global_socket.on('connect',function(){
			global_socket.emit('sendName',global_user.name);
		})
		//加入聊天室
		global_socket.emit('joinRoom',global_user.name);
		
		global_socket.on('toallmsg',function(data){
			var html = "<div class='sysMsg'>";
			html += "<span class='glyphicon glyphicon-bullhorn'></span>";
			html += " 系统：<strong>“"+data+"”</strong>加入聊天室！";
			html += '</div><br/>';
			$('.leftDiv .contentDiv').append(html);
			var height = $('.leftDiv .contentDiv')[0].scrollHeight;
			$('.leftDiv .contentDiv').scrollTop(height-548);
		});
		
		//在线人员列表
		global_socket.on('sendPersonList',function(data){
			$('.totalCount').text(data.length);
			var html = '';
			for(var i=0;i<data.length;i++) {
				if(data[i].name == global_user.name) {
					html += '<div style="color:#ffa20a;">';
					if(data[i].path){
						html += '<img src="'+data[i].path+'" style="position:relative;top:-2px;width:25px;height:25px;border-radius:100%;border:1px solid #ccc;margin-right:10px;"/>';
					}else{
						html += '<img src="./images/photo.png" style="position:relative;top:-2px;width:25px;height:25px;border-radius:100%;border:1px solid #ccc;margin-right:10px;"/>';
					}
					
					html += data[i].name+'</div>';
				}else{
					html += '<div>'
					if(data[i].path){
						html += '<img src="'+data[i].path+'" style="position:relative;top:-2px;width:25px;height:25px;border-radius:100%;border:1px solid #ccc;margin-right:10px;"/>';
					}else{
						html += '<img src="./images/photo.png" style="position:relative;top:-2px;width:25px;height:25px;border-radius:100%;border:1px solid #ccc;margin-right:10px;"/>';
					}
					html += data[i].name;
					html += '<span class="cursorPersonList" data-toggle="modal" data-target="#chatModal" data-whatever="'+data[i].name+'">私聊Ta</span></div>'
				}
				
			}
			$('.rightDiv .downDiv .content').html(html);
		})
	
		//公众接受消息
		global_socket.on('sendtoall',function(name,content,path,time){
			console.log(name,content,path,time)
			console.log(typeof path)
			var html ='';
			html += "<div class='personMsg'>";
			html += "<div class='personMsgInfo'>";
			if(path) {
				html += "<img class='picCircle' src='"+path+"'/>";//
			}else{
				html += "<img class='picCircle' src='/images/photo.png'/>";
			}
			
			html += "<div class='other'><div class='infoName'>"+name+"</div><div class='infoTime'>"+time+"</div></div>";
			html += "</div>";
			html += "<div class='personMsgContent'>"+content+"</div>";
			html += "</div>";
			$('.leftDiv .contentDiv').append(html);
			var height = $('.leftDiv .contentDiv')[0].scrollHeight;
			$('.leftDiv .contentDiv').scrollTop(height-570);
			$('.messageContent').html('');
		});
		//私聊消息（作为接受的一方）
		global_socket.on('saytosomebody_to_'+ global_user.name,function(from,content,time){
			var html = "<div class='sysMsg' style='background:rgba(255,162,10,0.1);display:block;color:#1c2b36;font-size:14px;'>";
			html += "<div style='font-size:14px;margin-bottom:10px;'>"+time+"</div>"
			html += "<strong>“"+from +"”</strong> 对你说：<div style='margin-top:10px;'>"+content+"</div>";
			html += '</div>';
			$('.leftDiv .contentDiv').append(html);
			var height = $('.leftDiv .contentDiv')[0].scrollHeight;
			$('.leftDiv .contentDiv').scrollTop(height-548);
		})
		//私聊消息（作为发出的一方）
		global_socket.on('saytosomebody_from_'+ global_user.name,function(to,content,time){
			var html = "<div class='sysMsg' style='background:rgba(255,162,10,0.1);display:block;color:#1c2b36;font-size:14px;'>";
			html += "<div style='font-size:14px;margin-bottom:10px;'>"+time+"</div>"
			html += "你对 <strong>“"+to +"”</strong> 说：<div style='margin-top:10px;'>"+content+"</div>";
			html += '</div>';
			$('.leftDiv .contentDiv').append(html);
			$('.contentTextarea').html('');
			$('#chatModal').modal('toggle');
			var height = $('.leftDiv .contentDiv')[0].scrollHeight;
			$('.leftDiv .contentDiv').scrollTop(height-548);
		})
		
		//公众接收图片
		global_socket.on('receiveImgPublic',function(url,name,path,time){
			var html ='';
			html += "<div class='personMsg'>";
			html += "<div class='personMsgInfo'>";
			if(path){
				html += "<img class='picCircle' src='"+ path +"'/>";
			}else{
				html += "<img class='picCircle' src='/images/photo.png'/>";
			}
			
			html += "<div class='other'><div class='infoName'>"+name+"</div><div class='infoTime'>"+time+"</div></div>";
			html += "</div>";
			html += "<div class='personMsgContent'><img src='"+url+"' style='max-width:200px;'/></div>";
			html += "</div>";
			$('.leftDiv .contentDiv').append(html);
			var height = $('.leftDiv .contentDiv')[0].scrollHeight;
			$('.leftDiv .contentDiv').scrollTop(height-548);
		})
		
		//私聊发送图片（作为接收的一方）
		global_socket.on('receiveImgPrivate_to_'+ global_user.name,function(from,url,time){
			var html = "<div class='sysMsg' style='background:rgba(255,162,10,0.1);display:block;color:#1c2b36;font-size:14px;'>";
			html += "<div style='font-size:14px;margin-bottom:10px;'>"+time+"</div>"
			html += "<strong>“"+from +"”</strong> 对你说：<div style='margin-top:10px;'><img src='"+url+"' style='max-width:200px;'/></div>";
			html += '</div>';
			$('.leftDiv .contentDiv').append(html);
			var height = $('.leftDiv .contentDiv')[0].scrollHeight;
			$('.leftDiv .contentDiv').scrollTop(height-548);
		});
		
		//私聊发送图片（作为发出的一方）
		global_socket.on('receiveImgPrivate_from_'+ global_user.name,function(to,url,time){
			var html = "<div class='sysMsg' style='background:rgba(255,162,10,0.1);display:block;color:#1c2b36;font-size:14px;'>";
			html += "<div style='font-size:14px;margin-bottom:10px;'>"+time+"</div>"
			html += "你对 <strong>“"+to +"”</strong> 说：<div style='margin-top:10px;'><img src='"+url+"' style='max-width:200px;'/></div>";
			html += '</div>';
			$('.leftDiv .contentDiv').append(html);
			$('.contentTextarea').html('');
			var height = $('.leftDiv .contentDiv')[0].scrollHeight;
			$('.leftDiv .contentDiv').scrollTop(height-548);
			$('#chatModal').modal('toggle');
		})
		
		//修改名字后系统消息
		global_socket.on('changeInfoMsg',function(oldName,newName){
			var html = "<div class='sysMsg'>";
			html += "<span class='glyphicon glyphicon-bullhorn'></span>";
			html += " 系统：<strong>“"+(global_user.name == oldName?'您':oldName)+"”</strong>将名字改为<strong>“"+newName+"”</strong>！";
			html += '</div><br/>';
			$('.leftDiv .contentDiv').append(html);
			var height = $('.leftDiv .contentDiv')[0].scrollHeight;
			$('.leftDiv .contentDiv').scrollTop(height-548);
		});
		
		//离线通知
		global_socket.on('saybyetoall',function(name){
			var html = "<div class='sysMsg'>";
			html += "<span class='glyphicon glyphicon-bullhorn'></span>";
			html += " 系统：<strong>“"+name+"”</strong>离开聊天室！";
			html += '</div><br/>';
			$('.leftDiv .contentDiv').append(html);
			var height = $('.leftDiv .contentDiv')[0].scrollHeight;
			$('.leftDiv .contentDiv').scrollTop(height-548);
		})
	}



	
//	global_socket.on('replyGoup',function(data){
//		console.log(data)
//	})
//	
//			$('#sendBtn').click(function(){
//			var val = $('#conentInput').val();
//			if(val) {
//				socket.emit('message',{str:val},function(socket,sockets){
//					$('#conentInput').val('');
//					console.log(socket);
//					console.log(sockets)
//				});
//			}
//		})
//		
//		$('#joinGroupOne').click(function(){
//			socket.emit('joinGroupOne');
//		});
//		
//		$('#joinGroupTwo').click(function(){
//			socket.emit('joinGroupTwo');
//		});
//		
//		$('#sendBtn_1').click(function(){
//			socket.emit('sendToGroupOne','msg1');
//		});
//		
//		$('#sendBtn_2').click(function(){
//			socket.emit('sendToGroupTwo','msg2');
//		});
//}
