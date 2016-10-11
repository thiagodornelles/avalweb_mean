var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var questionModel = require('../models/questionsModel');
var categoryModel = require('../models/categoriesModel');
var isLoggedIn = require('./baseMiddlewares');

var indexOf_Id = function(array, id){
	var index = -1;
	for (var i = 0; i < array.length; i++) {
		console.log(array[i]._id.toString() + ':' + id.toString());
	    if (array[i]._id.toString() == id.toString()) {
	        index = i;
	        break;
	    }
	}
	return index;
};

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
		question.category = req.body.category;
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
			else{
				var q = categoryModel.findById(req.body.category);
				q.exec(function(err, category){
					if(category){							
						category.questions.push(question);
						category.save();
					}
				});
				res.send('question saved');
			}
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
			var previousCategory = result.category;
			result.category = req.body.category;
			result.difficulty = req.body.difficulty;		
			result.answers[0] = req.body.answers[0];
			result.answers[1] = req.body.answers[1];
			result.answers[2] = req.body.answers[2];
			result.answers[3] = req.body.answers[3];
			result.answers[4] = req.body.answers[4];
			result.media = new Buffer(0);
			result.save(function(err, result) {
				if (err)
					res.send(err);
				else{					
					//Mudou categoria
					if (req.body.category != previousCategory){
						//Se anteriormente não tinha categoria específica, não remove
						if (previousCategory != ''){
							var q = categoryModel.findById(previousCategory);
							q.exec(function(err, category){
								if(category){
									var i = indexOf_Id(category.questions, req.params.id);
									if(i > -1)
									category.questions.splice(i, 1);
									category.save();
								}
							});
						}
						//Se a nova categoria é a raiz não há nada a atualizar
						if (req.body.category != ''){						
							var q = categoryModel.findById(req.body.category);
							q.exec(function(err, category){
								if(category){
									category.questions.push(result);
									category.save();
								}
							});
						}
					}
					res.send('question saved');
				}
			});
		}
		else{
			res.send('question not saved');
		}		
	});	
});


router.delete('/id/:id', function(req, res, next) {	
	var removeQuery = questionModel.findByIdAndRemove(req.params.id);
	removeQuery.exec(function(err, question) {
		if (err)
			res.send(err);
		else{			
			var q = categoryModel.findById(question.category);
			q.exec(function(err, category){
				if(category){					
					var i = indexOf_Id(category.questions, req.params.id);
					if(i > -1)
						category.questions.splice(i, 1);
					category.save();
				}
			});
			res.send('question removed');
		}
	});	
});

module.exports = router;
