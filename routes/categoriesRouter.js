var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var categoryModel = require('../models/categoriesModel');
var isLoggedIn = require('./baseMiddlewares');
var routerUtils = require('./routerUtils.js');
const util = require('util');
var rUtils = new routerUtils();

router.get('/', isLoggedIn, function(req, res, next) {
	return next();
});

router.get('/id/:id', function(req, res, next) {		
	var query = categoryModel.findById(req.params.id);	
	query.exec(function(err, result) {
		if (err)
			res.send(err);
		else {
			res.json(result);
		}
	})
});

router.get('/search', function(req, res, next) {
	var query = categoryModel.find({
			name: new RegExp(req.query.filter, 'i'),
			owner: req.session.passport.user.username
		})
		.populate({
			path: 'subCategories',
			populate: {
				path: 'subCategories',
				model: 'Category'
			}
		});
	query.lean().exec(function(err, result) {
		res.json(result);
	});
});

router.post('/', function(req, res, next) {
	if (req.body.name) {
		var category = new categoryModel();
		category.name = req.body.name;
		category.superCategory = req.body.superCategory;
		category.owner = req.session.passport.user.username;
		category.save(function(err, cat) {
			if (err)
				res.send(err);
			else {
				//Adicionando esta categoria a sua categoria pai
				categoryModel.findById(category.superCategory, function(err, result) {
					if (result) {
						result.subCategories.push(cat);
						result.save(function(err) {
							if (err) {
								res.send(err);
							} else
								res.send('category saved');
						});
					} else {
						res.send('category saved');
					}
				});
			}
		});
	} else {
		res.send('category not saved');
	}
});

router.put('/id/:id', function(req, res, next) {
	categoryModel.findById(req.params.id, function(err, result) {
		if (req.body.name) {
			result.name = req.body.name;
			var prevSuperCategory = result.superCategory;
			result.superCategory = req.body.superCategory;
			result.owner = req.session.passport.user.username;
			result.save(function(err) {
				if (err)
					res.send(err);
				else {
					//Super categoria não mudou
					if (prevSuperCategory === req.body.superCategory) {
						res.send('category saved');
					} else {
						//Remover a categoria pai antiga
						categoryModel.findById(prevSuperCategory, function(err, result2) {
							if (result2) {
								var index = rUtils.indexOf_Id(result2.subCategories, req.params.id);
								if (index > -1) {
									result2.subCategories.splice(index, 1);
								}
								result2.save(function(err) {
									if (err)
										res.send(err);
								});
							}
						});
						//Adicionar na categoria pai nova
						categoryModel.findById(req.body.superCategory, function(err, result2) {
							if (result2) {
								result2.subCategories.push(req.params.id);
								result2.save(function(err) {
									if (err)
										res.send(err);
								});
							}
						});
						res.send('category saved');
					}
				}
			});
		} else {
			res.send('category not saved');
		}
	});
});


router.delete('/id/:id', function(req, res, next) {
	var removeQuery = categoryModel.findByIdAndRemove(req.params.id);
	removeQuery.exec(function(err, result) {
		if (result) {
			console.log(result.subCategories);
			//Removendo as subcategorias se existirem
			if (result.subCategories.length > 0) {
				for (var i = 0; i < result.subCategories.length; i++) {
					var removeQuery2 = categoryModel.findByIdAndRemove(result.subCategories[i]);
					removeQuery2.exec(function(err, result2) {
						if (result2) {
							if (result2.subCategories.length > 0) {
								for (var i = 0; i < result2.subCategories.length; i++) {
									categoryModel.findByIdAndRemove(result2.subCategories[i],
										function(err, result3) {});
								}
							}
						}
					});
				}
			}
			//Removendo a sua referência de sua supercategoria se existe
			if (result.superCategory !== '') {
				categoryModel.findById(result.superCategory,
					function(err, result) {
						if (result) {
							var index = rUtils.indexOf_Id(result.subCategories, req.params.id);
							if (index > -1) {
								result.subCategories.splice(index, 1);
							}
							result.save();
						}
					});
			}
			res.send('category removed');
		} else {
			res.send('category not found');
		}
	});
	/*categoryModel.findByIdAndRemove(req.params.id).exec()
	.then(function(category){
		if (category.subCategories.length > 0) {
			for (var i = 0; i < category.subCategories.length; i++) {
				
			}
		}
	});*/
});

module.exports = router;