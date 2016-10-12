var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var isLoggedIn = require('./baseMiddlewares');


router.get('/', isLoggedIn, function(req, res, next){
	return next();
});

router.post('/', function(req, res, next) {	
	if (req.body.names && req.body.emails){
		res.send('invites ok');
	}
	else {
		res.send('invites not ok');
	}
	
});
module.exports = router;