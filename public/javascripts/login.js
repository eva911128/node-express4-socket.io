//定义登录表单验证规则
function initValidate() {
	$('.loginForm').bootstrapValidator({
		message: 'This value is not valid',
		feedbackIcons:{
			valid: 'glyphicon glyphicon-ok',
			invalid: 'glyphicon glyphicon-remove',
			validating: 'glyphicon glyphicon-refresh',
		},
		fields: {
			name:{
				validators: {
					notEmpty: {
						message:'用户名不能为空'
					},
					stringLength: {
                        max: 10,
                        message: '用户名长度必须在10位内'
                    },
				}
			},
			password:{
				validators: {
					notEmpty: {
						message:'密码不能为空'
					},
					stringLength: {
						min:6,
                        max:8,
                        message: '密码长度必须在6到8位之间'
                    },
					regexp: {
                        regexp: /^[a-zA-Z0-9_]+$/,
                        message: '密码只能包含大写、小写、数字和下划线'
                    }
				}
			}
		},
	})
}

function hasCookies(){
	var name = $.cookie('userName');
	var id = $.cookie('userId');
	var pwd = $.cookie('pwd');
	var path = $.cookie('path');
	if(name && pwd && id){
		var param = {
     	name: name,
     	password: pwd
     };
     $.post('/user/login',param,function(data){
     	if(data.success){
     		$('.showUserName').html(data.data.name);
     		if(data.data.path) {
     			$('#showUserPhoto')[0].src = data.data.path;
     		}	
     		$('.head .resgisterLink').hide();
     		$('.head .loginLink').hide();
     		$('.content .editBtn').css({display:''});
     		$('.photoInputStyle').css({display:''});
     		global_user = data.data;
     		initSocket();
     	}
     })
	}else{
		$('.head .resgisterLink').show();
 		$('.head .loginLink').show();
 		$('.editBtn').css({display:'none'});
 		$('.photoInputStyle').css({display:'none'});
	}
}

//表情包
function initQQemoji(type){
	$("#editor_"+type).emoji({
	    button: "#showEmojiDiv_"+type,
	    showTab: true,
	    animation: 'slide',
	    icons: [{
	        name: "QQ表情",
	        path: "../images/qq/",
	        maxNum: 91,
	        excludeNums: [41, 45, 54],
	        file: ".gif"
	    },{
	        name: "贴吧表情",
	        path: "../images/tieba/",
	        maxNum: 50,
	        excludeNums: [41, 45, 54],
	        file: ".jpg"
	    }]
	});
}
hljs.initHighlightingOnLoad();
initQQemoji('public');
initQQemoji('private');
initValidate();
hasCookies();

//发送图片,利用base64
 function sendImg(id) { 
    var file = $('#'+id)[0].files[0];       //得到该图片目前是一次只能发送一张，故取[0]  
    console.log(file)
   	if(!file){
   		return;
   	}
   	var reader = new FileReader();      //创建一个FileReader对象，进行下一步的操作
    reader.readAsDataURL(file);              //通过readAsDataURL读取图片  
    reader.onload = function () {            //读取完毕会自动触发，读取结果保存在result中  
        var data = {img: this.result};
        var time = new Date().pattern('yyyy-MM-dd HH:mm');
        if(id =='tupian_public') {
        	var path = global_user.path;
        	global_socket.emit('sendImgPublic',this.result,global_user.name,path,time);  
        }else{
        	global_socket.emit('sendImgPrivate',global_user.name,global_person,this.result,time)
        }
        
    }  
 }
//上传用户头像，利用ajax
function uploadPhoto(id) {
	var file = $("#"+id)[0].files;//一个字段可以上传多张图片
	var formData = new FormData();
	formData.append('upload_photo',file[0]);//头像只需要一个，multiple否则需要遍历
//	formData.append('upload_photo',file[1]);
	formData.append('userId',global_user.id);//带上id
	console.log(formData)
	$.ajax({
		url: '/user/uploadPhoto',
		type:'post',
		data: formData,
		async: false,
		cache: false,
		timeout: false,
		contentType: false,
		processData: false,
		success: function(data){
			alert(data.message);
			if(data.success) {
				console.log(data.data)
				$('#showUserPhoto')[0].src = data.data;
			}
		},
		error: function(xhr) {
			
		}
	})
}

//提交登录表单
$('#submitForm').click(function(){
	$('.loginForm').data('bootstrapValidator').validate();  
	if(!$('.loginForm').data('bootstrapValidator').isValid()){  
		return ;  
	} 
	if(global_form == 'login') {
		var param = {
	     	name: $('.loginForm #name').val(),
	     	password: $('.loginForm #password').val()
	     };
		$.post('/user/login',param,function(data){
			alert(data.message)
	     	if(data.success){
	     		$.cookie('userName',data.data.name);
	     		$.cookie('userId',data.data.id);
	     		$.cookie('pwd',data.data.pwd);
	     		console.log(data.data.path)
	     		$.cookie('path',data.data.path);
	     		$('.showUserName').html(data.data.name);
	     		$('.head .resgisterLink').hide();
	     		$('.head .loginLink').hide();
	     		$('.loginForm #name').val('');
	     		$('.loginForm #password').val('');
	     		if(data.data.path) {
	     			$('#showUserPhoto')[0].src = data.data.path;
	     		}	
	     		$('#myModal').modal('toggle');
	     		$('.content .editBtn').css({display:''});
	     		$('.photoInputStyle').css({display:''});
	     		global_user = data.data;
	     		initSocket();
	     	}
	     })
	 }else if(global_form == 'update') {
	 	var param = {
	 		newName:$('.loginForm #name').val(),
	 		newPwd: $('.loginForm #password').val(),
	 		oldName:$.cookie('userName'),
	 		oldPwd: $.cookie('pwd'),
	 	}
	 	$.post('/user/update',param,function(data){
	 		alert(data.message);
	 		if(data.success){
	 			$.cookie('userName',data.data.name);
	 			$.cookie('pwd',data.data.pwd);
	 			$('.showUserName').html(data.data.name);
	 			$('.loginForm #password').val('');
	 			$('#myModal').modal('toggle');
	 			global_socket.emit('changeInfo',param.oldName,param.newName,function(){
	 				global_user.name = data.data.name;
	 				global_user.pwd = data.data.pwd;
	 				global_socket.emit('getPersonList');
	 			}); 		 			
	 		}
	 	})
	 }else{
	 	console.log(global_form+'----');
	 	var param = {
	     	name: $('.loginForm #name').val(),
	     	password: $('.loginForm #password').val()
	    };
	 	$.post('/user/add',param,function(data){
	 		console.log(data);
			alert(data.message)
	     	if(data.success){
	     		$.cookie('userName',data.data.name);
	     		$.cookie('userId',data.data.id);
	     		$.cookie('pwd',data.data.pwd);
	     		$('.showUserName').html(data.data.name);
	     		$('.head .resgisterLink').hide();
	     		$('.head .loginLink').hide();
	     		$('#myModal').modal('toggle');
	     		$('.content .editBtn').css({display:''});
	     		$('.photoInputStyle').css({display:''});
	     		global_user = data.data;
	     		initSocket();
	     	}
	     })
	 }
});

//关闭登录模态框后，重置表单
 $('#myModal').on('hidden.bs.modal', function() {
    $(".loginForm").data('bootstrapValidator').destroy();
    $('.loginForm').data('bootstrapValidator', null);
    initValidate();
});
//登录按钮
$('.loginLink').click(function(){
	global_form = 'login';
	$('#myModalLabel').text('登录');
});
//编辑按钮
$('.editBtn').click(function() {
	global_form = 'update';
	$('#myModalLabel').text('编辑');
});
//注册按钮
$('.resgisterLink').click(function(){
	global_form = 'register';
	$('#myModalLabel').text('注册');
})
//发送消息按钮
$('.sendMessageBtn').click(function(){
	var content = $('.messageContent').html();
	if(content) {
		var time = new Date().pattern('yyyy-MM-dd HH:mm');
		var path = global_user.path;
		global_socket.emit('saytoall',global_user.name,content,path,time);
		
	}
})

//私聊按钮
$('#chatModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget)
  global_person = button.data('whatever'); 
  var modal = $(this);
  modal.find('.modal-title').text('对 ' + global_person+' 说：')
})
//发送私聊
$('#submitChatForm').click(function(){
	var content = $('.contentTextarea').html();
	if(content) {
		var time = new Date().pattern('yyyy-MM-dd HH:mm');
		global_socket.emit('saytosomebody',global_user.name,global_person,content,time,function(){
			
		})
	}
})
