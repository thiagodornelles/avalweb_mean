var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var categoryModel = require('../models/categoriesModel');
var isLoggedIn = require('./baseMiddlewares');


router.get('/', isLoggedIn, function(req, res, next){	
	return next();
});

router.get('/id/:id', function(req, res, next){
	var query = categoryModel.findById(req.params.id);
	query.exec(function(err, result){
		if (err)
			res.send(err);
		else{
			res.json(result);
		}
	})
});

router.get('/search', function(req, res, next) {		
	var query = categoryModel.find({name: new RegExp(req.query.filter, 'i')})
	.populate({ path: 'subCategories.id',
		populate: {
	    	path: 'subCategories.id',
	    	model: 'Category'
	    }
	});	
	query.exec(function (err, result){
		res.json(result);
	});
});

router.post('/', function(req, res, next) {	
	if(req.body.name){		
		var category = new categoryModel();
		category.name = req.body.name;
		for(var i = 0; i < req.body.questions.length; i++){
			category.questions.push(req.body.questions[i]);
		}
		for(var i = 0; i < req.body.subCategories.length; i++){
			category.subCategories.push(req.body.subCategories[i]);
		}		
		category.save(function(err) {
			if (err)
				res.send(err);
			else
				res.send('category saved');			
		});		
	}
	else{
		res.send('category not saved');	
	}
	
});

router.put('/id/:id', function(req, res, next) {	
	categoryModel.findById(req.params.id, function(err, result){
		if(req.body.name){			
			result.name = req.body.name;
			for(var i = 0; i < req.body.questions.length; i++){
				result.questions[i] = req.body.questions[i];
			}
			for(var i = 0; i < req.body.subCategories.length; i++){
				result.subCategories[i] = req.body.subCategories[i];
			}
			result.save(function(err) {
				if (err)
					res.send(err);
				else
					res.send('category saved');
			});
		}
		else{
			res.send('category not saved');
		}		
	});	
});


router.delete('/id/:id', function(req, res, next) {	
	var removeQuery = categoryModel.findByIdAndRemove(req.params.id);
	removeQuery.exec(function(err) {
		if (err)
			res.send(err);
		else{
			res.send('category removed');
		}
	});	
});

module.exports = router;
