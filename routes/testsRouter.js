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
	var query = testModel.find({ name: new RegExp(req.query.name, 'i')}).populate('categories').populate('questions');	
	query.exec(function (err, result){			
		res.json(result);		
	});		
});

router.post('/', function(req, res, next) {		
	if (req.body.name && req.body.date){
		var test = new testModel();
		test.name = req.body.name;
		test.date = req.body.date;
		test.strategy = req.body.strategy;
		test.type = req.body.type;
		//Prova por Categorias
		if(req.body.type == 1){			
			for(var i = 0; i < req.body.selectedCategories.length; i++){
				test.categories.push(req.body.selectedCategories[i]._id);
			}
			test.questions = [];
		}
		//Prova por questões
		else if(req.body.type == 2){			
			for(var i = 0; i < req.body.selectedQuestions.length; i++){
				test.questions.push(req.body.selectedQuestions[i]._id);
			}
			test.categories = [];
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
			result.type = req.body.type;
			//Prova por Categorias
			if(req.body.type == 1){
				result.categories = new Array();
				for(var i = 0; i < req.body.selectedCategories.length; i++){
					result.categories.push(req.body.selectedCategories[i]._id);
				}
				result.questions = new Array();
			}
			//Prova por questões
			else if(req.body.type == 2){
				result.questions = new Array();
				for(var i = 0; i < req.body.selectedQuestions.length; i++){
					result.questions.push(req.body.selectedQuestions[i]._id);
				}
				result.categories = new Array();
			}	
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