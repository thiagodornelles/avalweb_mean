var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var studentModel = require('../models/studentsModel')
var isLoggedIn = require('./baseMiddlewares');


router.get('/', isLoggedIn, function(req, res, next){
	return next();
});

router.get('/id/:id', function(req, res, next){
	var query = studentModel.findById(req.params.id);
	query.exec(function(err, result){
		if (err)
			res.send(err);
		else{
			res.json(result);
		}
	})
});

router.get('/search', function(req, res, next) {		
	var query = studentModel.find({ name: new RegExp(req.query.name, 'i')});	
	query.exec(function (err, result){			
		res.json(result);		
	});		
});

router.post('/', function(req, res, next) {	
	if(req.body.name && req.body.birthDate){		
		var student = new studentModel();
		student.name = req.body.name;
		student.birthDate = req.body.birthDate;
		student.photo = new Buffer(0);
		student.email = req.body.email;
		student.save(function(err) {
			if (err)
				res.send(err);
			else
				res.send('student saved');			
		});		
	}
	else{
		res.send('student not saved');	
	}
	
});

router.put('/id/:id', function(req, res, next) {	
	studentModel.findById(req.params.id, function(err, result){
		if(req.body.name && req.body.birthDate){			
			result.name = req.body.name;
			result.birthDate = req.body.birthDate;
			result.photo = new Buffer(0);
			result.email = req.body.email;
			result.save(function(err) {
				if (err)
					res.send(err);
				else
					res.send('student saved');
			});
		}
		else{
			res.send('student not saved');
		}		
	});	
});


router.delete('/id/:id', function(req, res, next) {	
	var removeQuery = studentModel.findByIdAndRemove(req.params.id);
	removeQuery.exec(function(err) {
		if (err)
			res.send(err);
		else{
			res.send('student removed');
		}
	});	
});

module.exports = router;
