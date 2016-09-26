var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var classModel = require('../models/classesModel')
var isLoggedIn = require('./baseMiddlewares');


router.get('/', isLoggedIn, function(req, res, next){
	return next();
});

router.get('/id/:id', function(req, res, next){
	var query = classModel.findById(req.params.id);
	query.exec(function(err, result){
		if (err)
			res.send(err);
		else{
			res.json(result);
		}
	})
});

router.get('/search', function(req, res, next) {		
	var query = classModel.find({ name: new RegExp(req.query.name, 'i')});	
	query.exec(function (err, result){			
		res.json(result);		
	});		
});

router.post('/', function(req, res, next) {	
	if (req.body.name){
		var clas = new classModel();
		clas.name = req.body.name;		
		for(var i = 0; i < req.body.students.length; i++){
			clas.students.push(req.body.students[i]);
		}
		clas.save(function(err) {
			if (err)
				res.send(err);
			else
				res.send('class saved');
		});		
	}
	else {
		res.send('class not saved');
	}
	
});

router.put('/id/:id', function(req, res, next) {	
	classModel.findById(req.params.id, function(err, result){
		if(req.body.name){			
			result.name = req.body.name;
			result.students = req.body.students;
			result.save(function(err) {
				if (err)
					res.send(err);
				else
					res.send('class saved');
			});
		}
		else{
			res.send('class not saved');
		}		
	});	
});

router.delete('/id/:id', function(req, res, next) {	
	var removeQuery = classModel.findByIdAndRemove(req.params.id);
	removeQuery.exec(function(err) {
		if (err)
			res.send(err);
		else{
			res.send('class removed');
		}
	});	
});

module.exports = router;