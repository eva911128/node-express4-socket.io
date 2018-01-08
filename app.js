var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multiparty = require('multiparty');

var index = require('./routes/index');
var users = require('./routes/users');



var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
var exphbs = require('express-handlebars');

app.engine('hbs',exphbs({
	layoutsDir: 'views',
  defaultLayout: '',
  extname: '.hbs'
}));
app.set('view engine','hbs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/first', index);
app.use('/user', users);
//app.post('/user/uploadPhoto',function(req,res){
//	var form = new multiparty.Form({uploadDir: './public/uploadPhoto'});
//	 //上传完成后处理
//  form.parse(req, function(err, fields, files){
//  	console.log(err);
//  	console.log(fields);
//  	console.log(files)
//      var inputFile = files.upload_photo[0];
//      var uploadedPath = inputFile.path;
//      var dstPath = './uploadPhoto/' + inputFile.originalFilename;
//      fs.rename(uploadedPath, dstPath, function(err) {
//          if(err){
//              console.log('rename error: ' + err);
//          } else {
//              console.log('rename ok');
//          }
//      });
//      files.file.path = dstPath;
//      var data = files;
        
//      res.send('ss');
//  });
//})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


//参考资料
/***
 * 表情包：https://github.com/eshengsky/jQuery-emoji 
*  上传图片两种方式：一种转换成base64(聊天中发送图片)，另一种直接上传(上传头像)
* 
* */