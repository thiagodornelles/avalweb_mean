var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var userModel = require('../models/usersModel')
var isLoggedIn = require('./baseMiddlewares');


router.get('/', isLoggedIn, function(req, res, next){
	return next();
});

router.get('/id/:id', function(req, res, next){
	var query = userModel.findById(req.params.id);
	query.exec(function(err, result){
		if (err)
			res.send(err);
		else{
			res.json(result);
		}
	})
});

router.get('/search', function(req, res, next) {		
	var query = userModel.find({ userName: new RegExp(req.query.name, 'i')});	
	query.exec(function (err, result){			
		res.json(result);		
	});		
});

router.post('/', function(req, res, next) {	
	if(req.body.userName && req.body.password){		
		var user = new userModel();
		user.userName = req.body.userName;
		user.password = req.body.password;
        user.type = req.body.type;
		user.save(function(err) {
			if (err)
				res.send(err);
			else
				res.send('user saved');			
		});		
	}
	else{
		res.send('user not saved');	
	}
	
});

router.put('/id/:id', function(req, res, next) {	
	userModel.findById(req.params.id, function(err, result){
		if(req.body.userName && req.body.password){			
			result.userName = req.body.userName;
			result.password = req.body.password;
			result.type = req.body.type;
			result.save(function(err) {
				if (err)
					res.send(err);
				else
					res.send('user saved');
			});
		}
		else{
			res.send('user not saved');
		}		
	});	
});


router.delete('/id/:id', function(req, res, next) {	
	var removeQuery = userModel.findByIdAndRemove(req.params.id);
	removeQuery.exec(function(err) {
		if (err)
			res.send(err);
		else{
			res.send('user removed');
		}
	});	
});

module.exports = router;
