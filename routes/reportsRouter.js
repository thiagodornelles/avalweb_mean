var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var testModel = require('../models/testsModel')
var classModel = require('../models/classesModel');
var studentTestModel = require('../models/studentTestsModel');
var isLoggedIn = require('./baseMiddlewares');

router.get('/', isLoggedIn, function (req, res, next) {
	return next();
});

router.get('/id/:id', function (req, res, next) {
	var query = testModel.findById(req.params.id);
	query.exec(function (err, result) {
		if (err)
			res.send(err);
		else {
			res.json(result);
		}
	})
});

router.get('/search', function (req, res, next) {
	var query = testModel.find({ name: new RegExp(req.query.name, 'i') });
	//.populate('categories').populate('questions');
	query.exec(function (err, result) {		
		res.json(result);
	});
});

router.get('/studentswithscore/:test_id', function (req, res, next) {
	var student_id = req.params.test_id;
	studentTestModel.find({test: student_id})
	.populate('answeredQuestions').populate('student').lean()
	.exec(function (err, results) {
		if(err){
			console.log(err);
			res.send([]);
		}
		else{		
			for (i = 0; i < results.length; i++){
				var total = 0;
				for (j = 0; j < results[i].answersGrade.length; j++){
					total += results[i].answersGrade[j];
				}
				results[i].grade = total/results[i].answersGrade.length;			 
			}
			res.json(results);
		}
	});
});

module.exports = router;