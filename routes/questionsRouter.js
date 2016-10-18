var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var questionModel = require('../models/questionsModel');
var categoryModel = require('../models/categoriesModel');
var isLoggedIn = require('./baseMiddlewares');
var RouterUtils = require('./routerUtils');
var multer = require('multer');
var rUtils = new RouterUtils();


//MULTER CONFIGS
var storage = multer.diskStorage({
	destination: function (req, file, cb) {		
		cb(null, __dirname + '/../public/uploads');		
	},
	filename: function (req, file, cb) {
		var s = file.originalname.split('.');
		var extension = s[s.length-1];
		var filename = 'f' + Math.random().toString(36).slice(-6) + Date.now() + '.' + extension;
		cb(null, filename);		
	}
});
var upload = multer({ "storage": storage });
var type = upload.array('files[]');


router.get('/', isLoggedIn, function (req, res, next) {
	return next();
});

router.get('/id/:id', function (req, res, next) {
	var query = questionModel.findById(req.params.id);
	query.exec(function (err, result) {
		if (err)
			res.send(err);
		else {
			res.json(result);
		}
	})
});

router.get('/search', function (req, res, next) {
	var query = questionModel.find({
		$or:
		[{ wording: new RegExp(req.query.filter, 'i') }]
	})
		.populate({ path: 'category', model: 'Category' });
	query.exec(function (err, result) {
		res.json(result);
	});
});

router.post('/upload', type, function (req, res, next) {
	if(req.files.length == 1){
		res.send(req.files[0].filename);
	}
	else{
		res.send('');
	}
});

router.post('/', type, function (req, res, next) {
	if (req.body.wording) {
		var question = new questionModel();
		question.wording = req.body.wording;
		question.category = req.body.category;
		question.difficulty = req.body.difficulty;
		question.imagePath = req.body.imagePath.data;
		if(!req.body.answers)
			req.body.answers = new Array();
		question.answers.push(req.body.answers[0]);
		question.answers.push(req.body.answers[1]);
		question.answers.push(req.body.answers[2]);
		question.answers.push(req.body.answers[3]);
		question.answers.push(req.body.answers[4]);		
		question.save(function (err) {
			if (err)
				res.send(err);
			else {
				var q = categoryModel.findById(req.body.category);
				q.exec(function (err, category) {
					if (category) {
						category.questions.push(question);
						category.save();
					}
				});
				res.send('question saved');
			}
		});
	}
	else {
		res.send('question not saved');
	}

});

router.put('/id/:id', function (req, res, next) {
	questionModel.findById(req.params.id, function (err, result) {
		if (req.body.wording) {
			result.wording = req.body.wording;
			var previousCategory = result.category;
			result.category = req.body.category;
			result.difficulty = req.body.difficulty;
			result.imagePath = req.body.imagePath.data;
			result.answers[0] = req.body.answers[0];
			result.answers[1] = req.body.answers[1];
			result.answers[2] = req.body.answers[2];
			result.answers[3] = req.body.answers[3];
			result.answers[4] = req.body.answers[4];			
			result.save(function (err, result) {
				if (err)
					res.send(err);
				else {
					if (req.body.category == undefined){
						req.body.category = new Object();
						req.body.category._id = '';
					}			
					//Mudou categoria
					if (req.body.category._id != previousCategory) {
						//Se anteriormente não tinha categoria específica, não remove
						if (previousCategory != '') {
							var q = categoryModel.findById(previousCategory);
							q.exec(function (err, category) {
								if (category) {
									var i = rUtils.indexOf_Id(category.questions, req.params.id);
									if (i > -1)
										category.questions.splice(i, 1);
									category.save();
								}
							});
						}
						//Se a nova categoria é a raiz não há nada a atualizar
						if (req.body.category != '') {
							var q = categoryModel.findById(req.body.category);
							q.exec(function (err, category) {
								if (category) {
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
		else {
			res.send('question not saved');
		}
	});
});


router.delete('/id/:id', function (req, res, next) {
	var removeQuery = questionModel.findByIdAndRemove(req.params.id);
	removeQuery.exec(function (err, question) {
		if (err)
			res.send(err);
		else {
			var q = categoryModel.findById(question.category);
			q.exec(function (err, category) {
				if (category) {
					var i = rUtils.indexOf_Id(category.questions, req.params.id);
					if (i > -1)
						category.questions.splice(i, 1);
					category.save();
				}
			});
			res.send('question removed');
		}
	});
});

module.exports = router;
