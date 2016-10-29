var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var async = require('async');
var testModel = require('../models/testsModel');
var classModel = require('../models/classesModel');
var studentModel = require('../models/studentsModel');
var studentTestModel = require('../models/studentTestsModel');
var questionModel = require('../models/questionsModel');
var categoryModel = require('../models/categoriesModel');
var CONSTS = require('../constants');
var isLoggedIn = require('./baseMiddlewares');
var TestStrategy = require('../testStrategy');
var BalanceStrategy = require('./balanceStrategy');
var StudentTestUtils = require('./studentTestUtils');
const util = require('util');


/*
* -----------------------------------------------------------------------------------
* INÍCIO -- Código referente a geração de uma estrategia de aplicação de avaliação
* -----------------------------------------------------------------------------------
*/

//Instanciamos o objeto que guarda a estratégia de aplicação
var testStrat = new TestStrategy();

// Implementamos uma estrategia conforme a resposta da última questão
// e a questões do banco
var DefaultStrategy = function () {
	this.nextQuestion = function (answer, questions, anyData) {
		return questions[0];
	}
};
//Instanciamos esta estrategia
var def = new DefaultStrategy();
var difBalance = new BalanceStrategy();

//Setamos nossa estrategia padrão no objeto que gerencia a escolhas das questões
testStrat.setStrategy(def);

/*
* -----------------------------------------------------------------------------------
* FIM -- Código referente a geração de uma estrategia de aplicação de avaliação
* -----------------------------------------------------------------------------------
*/


//Funçoes de utilidade
var stUtil = new StudentTestUtils();

router.get('/', isLoggedIn, function (req, res, next) {
	return next();
});

router.get('/id/:id', function (req, res, next) {
	var query = testModel.findById(req.params.id);
	query.exec(function (err, test) {
		if (err)
			res.send(err);
		else {
			res.json(test);
		}
	});
});

router.get('/finishedtest/:id', function (req, res, next) {
	//Busca registro mais atual do estado de execução da avaliação
	studentTestModel.find({
		'user': req.session.passport.user.username,
		'test': req.params.id //ID da avaliação
	})
		.limit(1).populate('answeredQuestions')
		.exec(function (err, studTest) {
			if (studTest.length > 0) {
				res.send(studTest[0]);
			}
			else {
				res.send("test not finished");
			}
		});
});

router.get('/search', function (req, res, next) {
	var username = req.session.passport.user.username;
	studentModel.findOne({ email: username })
		.exec(function (err, student) {
			if (student) {
				classModel.find({ students: student._id })
					.exec(function (err, classes) {
						if (classes) {
							testModel.find({ classes: { $in: classes } }, '-questions')
								.exec(function (err, tests) {
									if (tests)
										res.json(tests);
									else
										res.json([]);
								});
						}
					});
			}
		});
});

/*
* Rota que inicia uma avaliação pelo aluno, define em sessão
* a avaliação que está em aplicação.
*/
router.post('/starttest', function (req, res, next) {
	//Validando se o teste existe
	var query = testModel.findById(req.body._id)
		.populate({ path: 'questions', select: '-answers.feedback -answers.rightAnswer' });

	query.exec(function (err, test) {
		if (err)
			res.send(err);
		else {
			if (test.strategy == CONSTS.FIXED_ORDER)
				testStrat.setStrategy(def);
			else if (test.strategy == CONSTS.DIF_BALANCE)
				testStrat.setStrategy(difBalance);

			//Se existe, grava a informação do usuário no log da prova
			if (test._id == req.body._id) {
				//Solicita uma questão para começar.
				var question;
				if (test.type == CONSTS.EVAL_BY_CATEGORIES) {
					if (test.categories.length > 0) {
						//Popular três niveis de subCategorias e suas questões
						var q = categoryModel.findById(test.categories[0])
							.populate(
							{
								path: 'subCategories', model: 'Category',
								populate: { path: 'subCategories', model: 'Category' }
							})
							.lean();
						q.exec(function (err, category) {
							categoryModel.populate(category,
								{
									path: 'questions subCategories.questions subCategories.subCategories.questions',
									model: 'Question', options: { lean: true }
								},
								function (err, category) {
									//Pega as questões na hierarquia
									category.questions = stUtil.getQuestionsFromCategory(category);

									if (category.questions.length > 0) {
										var studTest = new studentTestModel();
										studentModel.findOne({ email: req.session.passport.user.username })
											.exec(function (err, student) {
												studTest.user = req.session.passport.user.username;
												studTest.test = req.body._id;
												studTest.student = student._id;
												studTest.date = new Date();
												studTest.finished = false;
												studTest.answeredCategories.push(category._id);
												studTest.categoriesToAnswer = test.categories;
												for (i = 0; i < test.categories.length; i++) {
													studTest.repeatedCategory.push(false);
												}
												studTest.actualCategory = 1;
												studTest.numberRetries = 0;
												studTest.save(function (err, st) {
													if (err) {
														console.log(err);
														res.send('end of test');
													}
													else {
														req.session.passport.user.test = req.body._id;
														question = testStrat.nextQuestion('', category.questions, req);
														//Envia a questão
														res.send(question);
													}
												});
											});
									}
									else {
										res.send("end of test");
									}
								}
							);
						});
					}
					else {
						res.send("end of test");
					}
				}
				else if (test.type == CONSTS.EVAL_BY_QUESTIONS) {
					studentModel.findOne({ email: req.session.passport.user.username })
						.exec(function (err, student) {
							var studTest = new studentTestModel();
							studTest.user = req.session.passport.user.username;
							studTest.test = req.body._id;
							studTest.student = student._id;
							studTest.date = new Date();
							studTest.finished = false;
							studTest.numberRetries = 0;
							studTest.save(function (err, st) {
								if (err) {
									console.log(err);
									res.send('end of test');
								}
								else {
									req.session.passport.user.test = req.body._id;
									question = testStrat.nextQuestion('', test.questions, req);
									//Envia a questão
									res.send(question);
								}
							});
						});
				}
			}
			else {
				res.send('test not started');
			}
		}
	});
});

router.post('/checkquestion', function (req, res, next) {

	if (req.body.answer_id && req.body.question_id) {
		//Buscando a questão na base
		questionModel.findById(req.body.question_id)
			.exec(function (err, question) {
				if (question) {
					//Tranformar em um objeto normal javascript para permitir adições
					question = question.toObject();
					//Campo para marcar a resposta como correta se for o caso
					question.right = false;
					//Conferindo se a resposta está correta
					for (var i = 0; i < question.answers.length; i++) {
						if (question.answers[i]._id.toString() === req.body.answer_id &&
							question.answers[i].rightAnswer) {
							question.right = true;
							break;
						}
					}
					//Marcando a resposta enviada pelo usuário
					studentTestModel.find({
						'user': req.session.passport.user.username,
						'test': req.body._id //ID da avaliação
					})
						.limit(1)
						.sort({ 'date': -1 })
						.exec(function (err, studTest) {
							studTest[0].answeredQuestions.push(req.body.question_id);
							studTest[0].answers.push(req.body.answer_id);
							if (question.right)
								studTest[0].answersGrade.push(1);
							else
								studTest[0].answersGrade.push(0);
							studTest[0].save();
							//Enviando a questão com as respostas e se foi acertada ou não
							res.send(question);
						});
				}
				else {
					res.end();
				}
			});
	}
	else {
		res.end();
	}
});

/*
* Rota que encaminha as questões
* TODO Avaliar a modularização...
*/

router.post('/nextquestion', function (req, res, next) {
	if (req.body.answer_id) {
		//Busca registro mais atual do estado de execução da avaliação
		studentTestModel.find({
			'user': req.session.passport.user.username,
			'test': req.body._id //ID da avaliação
		})
			.limit(1).sort({ 'date': -1 })
			.exec(function (err, studTest) {
				//Validando se encontrou registro de avaliação para este usuário			
				if (studTest.length > 0) {
					//Busca os dados das questões da avaliação					
					testModel.findById(req.body._id).populate(
						{
							path: 'questions categories'
						}
					)
						.exec(function (err, test) {
							//console.log(test);
							if (test) {
								//Selecionando a estratégia
								if (test.strategy == CONSTS.FIXED_ORDER)
									testStrat.setStrategy(def);
								else if (test.strategy == CONSTS.DIF_BALANCE)
									testStrat.setStrategy(difBalance);

								var qtemp = test.questions;
								var ctemp = test.categories;
								//Verificar se o aluno acertou a última questão respondida
								answered = studTest[0].answeredQuestions;
								var lastQuestion = answered[answered.length - 1];

								//Procurando a questão respondida
								questionModel.findById(lastQuestion)
									.exec(function (err, question) {
										var rightAnswer = false;
										var lastAnswer = studTest[0].answers[studTest[0].answers.length - 1];
										for (var i = 0; i < question.answers.length; i++) {
											if (question.answers[i]._id.toString() == lastAnswer.toString() &&
												question.answers[i].rightAnswer) {
												rightAnswer = true;
												break;
											}
										}
										//----------------------
										//  PROVA POR QUESTOES
										//----------------------
										if (test.type == CONSTS.EVAL_BY_QUESTIONS) {
											//Remoção das questões já respondidas
											//As questões não respondidas serão avaliadas pelo seletor de questões
											var questionsAns = studTest[0].answeredQuestions;
											for (var i = qtemp.length - 1; i > -1; i--) {
												for (var j = 0; j < questionsAns.length; j++) {
													if (questionsAns[j].toString() == qtemp[i]._id.toString()) {
														qtemp.splice(i, 1);
														break;
													}
												}
											}

											if (qtemp.length <= 0) {
												studTest[0].finished = true;
												studTest[0].save();
												res.send('end of test');
											}
											else {
												//**** Buscando nova questão *****
												req.session.passport.user.test = req.body._id;
												var question = testStrat.nextQuestion(rightAnswer, qtemp, req);

												//Grava nova questão a responder
												// studTest[0].answeredQuestions.push(question._id);
												// studTest[0].save();
												res.send(question);
											}
										}
										//----------------------
										// PROVA POR CATEGORIAS
										//----------------------
										else if (test.type == CONSTS.EVAL_BY_CATEGORIES) {
											//Buscar questões da próxima categoria
											var actualCategory = studTest[0].actualCategory;
											if (actualCategory > (studTest[0].categoriesToAnswer.length - 1) && rightAnswer) {
												studTest[0].finished = true;
												studTest[0].save();
												res.send("end of test");
												return;
											}
											var ok = true;
											async.whilst(
												function () { return ok; },
												function (callback) {
													if (actualCategory > (studTest[0].categoriesToAnswer.length) - 1 && rightAnswer) {
														studTest[0].finished = true;
														studTest[0].save();
														ok = true;
														res.send("end of test");
														return;
													}
													//Popular três niveis de subCategorias e suas questões
													var q = categoryModel.findById(studTest[0].categoriesToAnswer[actualCategory])
														.populate(
														{
															path: 'subCategories', model: 'Category',
															populate: { path: 'subCategories', model: 'Category' }
														});
													q.exec(function (err, category) {
														categoryModel.populate(
															category,
															{
																path: 'questions subCategories.questions subCategories.subCategories.questions',
																model: 'Question'
															},
															function (err, category) {
																if (!category) {
																	res.send("end of test");
																	//Se não achou a categoria deve sair do loop
																	ok = false;
																	callback();
																}
																else {
																	//Pega as questões na hierarquia																
																	category.questions = stUtil.getQuestionsFromCategory(category);
																	//Remoção das questões já respondidas											
																	var questionsAns = studTest[0].answeredQuestions;
																	for (var i = category.questions.length - 1; i > -1; i--) {
																		for (var j = 0; j < questionsAns.length; j++) {
																			if (questionsAns[j].toString() == category.questions[i]._id.toString()) {
																				category.questions.splice(i, 1);
																				break;
																			}
																		}
																	}
																	if (category.questions.length > 0) {
																		req.session.passport.user.test = req.body._id;
																		var anyData = { req: req, studTest: studTest[0] };
																		question = testStrat.nextQuestion(rightAnswer, category.questions, anyData);
																		studTest[0].user = req.session.passport.user.username;
																		studTest[0].test = req.body._id;
																		studTest[0].date = new Date();
																		studTest[0].answeredCategories.push(category._id);
																		studTest[0].actualCategory++;
																		actualCategory = studTest[0].actualCategory;
																		studTest[0].save();
																		req.session.passport.user.test = studTest._id;
																		//Envia a questão
																		res.send(question);
																		ok = false;
																		callback();
																	}
																	else {
																		ok = true;
																		studTest[0].actualCategory++;
																		actualCategory = studTest[0].actualCategory;
																		studTest[0].save();
																		callback();
																	}
																}
															})
													});
												},
												function (err) {
													console.log(err);
												}
											);
										}
									});
							}
						});
				}
				else {
					res.send(err);
				}
			});
	}
	else {
		return next();
	}
});

router.post('/', function (req, res, next) {
	if (req.body.name && req.body.date) {
		var test = new testModel();
		test.date = req.body.date;
		test.name = req.body.name;
		for (var i = 0; i < req.body.questions.length; i++) {
			test.questions.push(req.body.questions[i]);
		}
		test.save(function (err) {
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

module.exports = router;