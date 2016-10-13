var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var testModel = require('../models/testsModel');
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
	this.nextQuestion = function (answer, questions) {
		if (questions.length == 0) {
			return "end of test";
		}
		// console.log(questions);
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
	query.exec(function (err, result) {
		if (err)
			res.send(err);
		else {
			res.json(result);
		}
	});
});

router.get('/search', function (req, res, next) {
	var query = testModel.find({ name: new RegExp(req.query.name, 'i') }, '-questions');
	query.exec(function (err, result) {
		res.json(result);
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

	query.exec(function (err, result) {
		if (err)
			res.send(err);
		else {
			if (result.strategy == CONSTS.FIXED_ORDER)
				testStrat.setStrategy(def);
			else if (result.strategy == CONSTS.DIF_BALANCE)
				testStrat.setStrategy(difBalance);

			//Se existe, grava a informação do usuário no log da prova
			if (result._id == req.body._id) {
				//Solicita uma questão para começar.
				var question;
				if (result.type == CONSTS.EVAL_BY_CATEGORIES) {
					if (result.categories.length > 0) {
						//Popular três niveis de subCategorias e suas questões
						var q = categoryModel.findById(result.categories[0])
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
										question = testStrat.nextQuestion('', category.questions);
										var studTest = new studentTestModel();
										studTest.user = req.session.passport.user.username;
										studTest.test = req.body._id;
										studTest.date = new Date();
										studTest.actualCategory = 0;
										studTest.answeredQuestions.push(question);
										studTest.save();

										req.session.passport.user.test = studTest._id;
										//Envia a questão
										res.send(question);
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
				else if (result.type == CONSTS.EVAL_BY_QUESTIONS) {
					question = testStrat.nextQuestion('', result.questions);
					var studTest = new studentTestModel();
					studTest.user = req.session.passport.user.username;
					studTest.test = req.body._id;
					studTest.date = new Date();
					studTest.answeredQuestions.push(question._id);
					studTest.save();

					req.session.passport.user.test = studTest._id;
					//Envia a questão
					// console.log(question);
					res.send(question);
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
				studTest[0].save();
			});
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
					//Enviando a questão com as respostas e se foi acertada ou não
					res.send(question);
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
								//**** Buscando nova questão *****
								var question = testStrat.nextQuestion(rightAnswer, qtemp);

								//String que termina o teste
								if (question == 'end of test') {
									res.send(question);
								}
								else {
									//Grava nova questão a responder
									studTest[0].answeredQuestions.push(question._id);
									studTest[0].save();
									res.send(question);
								}
							}
							//----------------------
							// PROVA POR CATEGORIAS
							//----------------------
							else if (test.type == CONSTS.EVAL_BY_CATEGORIES) {
								//-------------------------------------------------------
								// Se acertar devemos pegar a proxima categoria da prova
								//-------------------------------------------------------
								if (rightAnswer) {
									studTest[0].actualCategory = studTest[0].actualCategory + 1;
								}
								studTest[0].answeredQuestions.push(question._id);									
								studTest[0].save();

								//Buscar questões da próxima categoria
								var actualCategory = studTest[0].actualCategory;
								if (actualCategory >= test.categories.length){
									res.send("end of test");
									return;
								}												
								//Popular três niveis de subCategorias e suas questões
								var q = categoryModel.findById(test.categories[actualCategory])
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
											//Pega as questões na hierarquia
											category.questions = stUtil.getQuestionsFromCategory(category);											
											//Remoção das questões já respondidas											
											var questionsAns = studTest[0].answeredQuestions;
											for (var i = category.questions.length - 1; i > -1; i--) {
												for (var j = 0; j < questionsAns.length; j++) {
													if (questionsAns[j].toString() == category.questions[i]._id.toString()) {
														console.log('removed');
														console.log(category.questions[i]);
														category.questions.splice(i, 1);
														break;
													}
												}
											}
											if (category.questions.length > 0) {												
												question = testStrat.nextQuestion('', category.questions);												
												studTest[0].user = req.session.passport.user.username;
												studTest[0].test = req.body._id;
												studTest[0].date = new Date();
												studTest[0].actualCategory = actualCategory;
												studTest[0].answeredQuestions.push(question);
												studTest[0].save();

												req.session.passport.user.test = studTest._id;
												//Envia a questão
												res.send(question);
												return;
											}
											else {												
												res.send("end of test");
											}
										})
								});								
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