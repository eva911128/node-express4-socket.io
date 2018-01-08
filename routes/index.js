var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index');
	//res.redirect('/html/index.html');
});

router.get('/first',function(req,res,next){
	res.json({name:'abc',pwd:'123'})
});

module.exports = router;
