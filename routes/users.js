var express = require('express');
var router = express.Router();
var baseDb  = require('../baseDbConfig').connect();
var multiparty = require('multiparty');
var fs = require('fs');

/* GET users listing. */
router.post('/login', function(req, res, next) {
	var name = req.param('name');
	var password = req.param('password');
	baseDb.query('select * from user where name= "'+name+'" and password="'+password+'"',function(err,data){
		if(err) {
			console.log(err.stack)
		}else{
			if(data.length>0) {
//				if(data[0].status == 'up') {
//					res.json({
//							success: false,
//							message:'该账号已在别处登录',
//						})
//				}else{
					baseDb.query('update user set status="up" where name="'+name+'" and password="'+password+'"',function(err){
						if(err) {
							console.log(err.stack);
						}else{
							res.json({
								success: true,
								message:'登录成功',
								data:{name:name,id:data[0].id,pwd:password,path:data[0].path}
							})
						}
					})
//				}	
			}else{
				res.json({
					success: false,
					message:'用户名或者密码不存在'
				})
			}
		}
	})
});
router.post('/add', function(req, res, next) {
	var name = req.param('name');
	var password = req.param('password');
	baseDb.query('select * from user where name= "'+name+'"',function(err,data){
		if(err) {
			console.log(err.stack);
		}else{
			if(data.length>0) {
				res.json({
					success: false,
					message:'改昵称已存在',
				})
			}else{
				baseDb.query('insert into user (name,password,status) values ("'+name+'","'+password+'","up")',function(err,data_){
					if(err) {
						console.log(err.stack)
					}else{
						res.json({
							success: true,
							message:'注册成功',
							data:{name:name,id:data_.insertId,pwd:password}
						})
					}
				})
			}
		}
	})
	
});
router.post('/update',function(req,res,next){
	var newName = req.param('newName');
	var newPwd = req.param('newPwd');
	var oldName = req.param('oldName');
	var oldPwd = req.param('oldPwd');
	baseDb.query('update user set name = "'+newName+'",password="'+newPwd+'" where name="'+oldName+'" and password="'+oldPwd+'"',function(err){
		if(err){
			console.log(err.stack);
		}else{
			res.json({
				success: true,
				message:'修改成功',
				data:{name:newName,pwd:newPwd}
			})
		}
	})
});
router.post('/uploadPhoto',function(req,res,next){
	var form = new multiparty.Form();
	form.encodeing = 'utf-8';
	form.uploadDir = 'public/uploadPhoto';
	form.keepExtensions = true;  //保留后缀
	form.parse(req,function(err,fields,files){
//		files格式:
//		{
//			upload_photo:[{//upload_photo是前端定义的,一个字段可以上传多张图片
//				fieldName:'upload_photo',
//				originalFilename: 'height.png',
//				path:'public/uploadPhoto/xxxxxxx.png',
//				headers:[object],
//				size: 133137
//			},{
//				fieldName:'upload_photo',
//				originalFilename: 'width.png',
//				path:'public/uploadPhoto/xxxxxxx.png',
//				headers:[object],
//				size: 133137
			//}]
//		}
		var file = files.upload_photo[0];
		
		var userId = fields.userId[0];
		var time = new Date().getTime();
		var oldPath = file.path;
		var newPath = 'public/uploadPhoto/'+ time +'_'+file.originalFilename;
		var savePath = '/uploadPhoto/'+ time +'_'+file.originalFilename;
		//利用fs.rename(oldPath,newPath,callback)方法，将图片命名为真实图片名
		fs.rename(oldPath,newPath,function(err){
			if(err){
				console.log(err);
			}else{
				baseDb.query('update user set path="'+ savePath +'" where id="'+userId+'"',function(err,data){
					if(err){
						console.log(err.stack);
					}else{
						console.log(data)
						res.json({
							success: true,
							message:'上传成功',
							data:savePath
						})
					}
				})
			}
		})
	});
})


module.exports = router;