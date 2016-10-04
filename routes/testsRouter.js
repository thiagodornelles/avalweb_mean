var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var testModel = require('../models/testsModel')
var isLoggedIn = require('./baseMiddlewares');


router.get('/', isLoggedIn, function(req, res, next){
	return next();
});

router.get('/id/:id', function(req, res, next){
	var query = testModel.findById(req.params.id);
	query.exec(function(err, result){
		if (err)
			res.send(err);
		else{
			res.json(result);
		}
	})
});

router.get('/search', function(req, res, next) {		
	var query = testModel.find({ name: new RegExp(req.query.name, 'i')});	
	query.exec(function (err, result){			
		res.json(result);		
	});		
});

router.post('/', function(req, res, next) {	
	// console.log(req.body);
	if (req.body.name && req.body.date){
		var test = new testModel();
		test.name = req.body.name;
		test.date = req.body.date;
		test.strategy = req.body.strategy;
		for(var i = 0; i < req.body.questions.length; i++){
			test.questions.push(req.body.questions[i]);
		}		
		test.save(function(err) {
			if (err)
				res.send(err);
			else
				res.send('test saved');
		});		
	}
	else {
		res.send('test not saved');
	}
	
});

router.put('/id/:id', function(req, res, next) {	
	testModel.findById(req.params.id, function(err, result){
		if(req.body.name && req.body.date){			
			result.name = req.body.name;
			result.date = req.body.date;
			result.questions = req.body.questions;			
			result.strategy = req.body.strategy;
			result.save(function(err) {
				if (err)
					res.send(err);
				else
					res.send('test saved');
			});
		}
		else{
			res.send('test not saved');
		}		
	});	
});

router.delete('/id/:id', function(req, res, next) {	
	var removeQuery = testModel.findByIdAndRemove(req.params.id);
	removeQuery.exec(function(err) {
		if (err)
			res.send(err);
		else{
			res.send('test removed');
		}
	});	
});

module.exports = router;