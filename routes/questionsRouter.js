var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var questionModel = require('../models/questionsModel');
var isLoggedIn = require('./baseMiddlewares');


router.get('/', isLoggedIn, function(req, res, next){
	return next();
});

router.get('/id/:id', function(req, res, next){
	var query = questionModel.findById(req.params.id);
	query.exec(function(err, result){
		if (err)
			res.send(err);
		else{
			res.json(result);
		}
	})
});

router.get('/search', function(req, res, next) {		
	var query = questionModel.find({$or:[
										{wording: new RegExp(req.query.filter, 'i')},									
										{subject: new RegExp(req.query.filter, 'i')}
										]});	
	query.exec(function (err, result){		
		res.json(result);		
	});		
});

router.post('/', function(req, res, next) {	
	if(req.body.wording && req.body.subject){		
		var question = new questionModel();
		question.wording = req.body.wording;
		question.subject = req.body.subject;
		question.difficulty = req.body.difficulty;
		question.answers.push(req.body.answers[0]);
		question.answers.push(req.body.answers[1]);
		question.answers.push(req.body.answers[2]);
		question.answers.push(req.body.answers[3]);
		question.answers.push(req.body.answers[4]);		
		question.media = new Buffer(0);
		question.save(function(err) {
			if (err)
				res.send(err);
			else
				res.send('question saved');			
		});		
	}
	else{
		res.send('question not saved');	
	}
	
});

router.put('/id/:id', function(req, res, next) {	
	questionModel.findById(req.params.id, function(err, result){
		if(req.body.wording && req.body.subject){			
			result.wording = req.body.wording;
			result.subject = req.body.subject;
			result.difficulty = req.body.difficulty;		
			result.answers[0] = req.body.answers[0];
			result.answers[1] = req.body.answers[1];
			result.answers[2] = req.body.answers[2];
			result.answers[3] = req.body.answers[3];
			result.answers[4] = req.body.answers[4];
			result.media = new Buffer(0);
			result.save(function(err) {
				if (err)
					res.send(err);
				else
					res.send('question saved');
			});
		}
		else{
			res.send('question not saved');
		}		
	});	
});


router.delete('/id/:id', function(req, res, next) {	
	var removeQuery = questionModel.findByIdAndRemove(req.params.id);
	removeQuery.exec(function(err) {
		if (err)
			res.send(err);
		else{
			res.send('question removed');
		}
	});	
});

module.exports = router;
