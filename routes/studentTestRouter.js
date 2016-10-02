var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var testModel = require('../models/testsModel');
var studentTestModel = require('../models/studentTestsModel');
var questionModel = require('../models/questionsModel');
var isLoggedIn = require('./baseMiddlewares');
var TestStrategy = require('../testStrategy');

/* 
 * -----------------------------------------------------------------------------------
 * INÍCIO -- Código referente a geração de uma estrategia de aplicação de avaliação
 * -----------------------------------------------------------------------------------
 */

//Instanciamos o objeto que guarda a estratégia de aplicação
var testStrat = new TestStrategy(studentTestModel, testModel);

// Implementamos uma estrategia conforme a resposta da última questão
// e a questões do banco
var DefaultStrategy = function(){	
	this.nextQuestion = function(answer, questions){		
		if(questions.length == 0){
			return "end of test";
		}

		//Ordenando pela prioridade
		questions.sort(function(a, b){
			return a.priority - b.priority;
		});				
		
		return questions[0];
	}
};
//Instanciamos esta estrategia
var def = new DefaultStrategy();
//Setamos nossa estrategia no objeto que gerencia a escolhas das questões
testStrat.setStrategy(def);

/*
 * -----------------------------------------------------------------------------------
 * FIM -- Código referente a geração de uma estrategia de aplicação de avaliação
 * -----------------------------------------------------------------------------------
 */

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
	});
});

router.get('/search', function(req, res, next) {		
	var query = testModel.find({ name: new RegExp(req.query.name, 'i')}, '-questions');	
	query.exec(function (err, result){		
		res.json(result);		
	});		
});

/*
 * Rota que inicia uma avaliação pelo aluno, define em sessão
 * a avaliação que está em aplicação.
 */
router.post('/starttest', function(req, res, next) {	
	//Validando se o teste existe	
	var query = testModel.findById(req.body._id)	
	.populate({ path: 'questions.id', select: '-answers.feedback -answers.rightAnswer' });

	query.exec(function(err, result){
		if (err)
			res.send(err);
		else{
			//Se existe, grava a informação do usuário no log da prova
			if (result._id == req.body._id){				
				//Solicita uma questão para começar.
				var question = testStrat.nextQuestion('', result.questions);
				var studTest = new studentTestModel();				
				studTest.user = req.session.passport.user.username;
				studTest.test = req.body._id;
				studTest.date = new Date();				
				studTest.questionsAnswered.push(question.id._id);
				studTest.save();

				req.session.passport.user.test = studTest._id;
				//Envia a questão
				res.send(question.id);
			}
			else{
				res.send('test not started');
			}
		}
	});		
});

router.post('/checkquestion', function(req, res, next){

	if(req.body.answer_id && req.body.question_id){
		//Marcando a resposta enviada pelo usuário
		studentTestModel.find({
			'user': req.session.passport.user.username,
			'test': req.body._id //ID da avaliação
		})
		.limit(1)
		.sort({ 'date': -1 })
		.exec(function(err, studTest){				
			studTest[0].answers.push(req.body.answer_id);
			studTest[0].save();
		});
		//Buscando a questão na base		
		questionModel.findById(req.body.question_id)
		.exec(function(err, question){
			if (question){
				//Tranformar em um objeto normal javascript para permitir adições
				question = question.toObject();
				//Campo para marcar a resposta como correta se for o caso
				question.right = false;
				//Conferindo se a resposta está correta				
				for (var i = 0; i < question.answers.length; i++) {					
					if (question.answers[i]._id.toString() === req.body.answer_id &&
						question.answers[i].rightAnswer){
						question.right = true;						
						break;
					}
				}				
				//Enviando a questão com as respostas e se foi acertada ou não
				res.send(question);
			}
			else{
				res.end();		
			}		
		});
	}
	else{
		res.end();
	}
});

/*
 * Rota que encaminha as questões
 * TODO Avaliar a modularização...
 */
router.post('/nextquestion', function(req, res, next) {
	if (req.body.answer_id){
		//Busca registro mais atual do estado de execução da avaliação
		studentTestModel.find({
			'user': req.session.passport.user.username,
			'test': req.body._id //ID da avaliação
		})
		.limit(1)
		.sort({ 'date': -1 })

		.exec(function(err, studTest){
			//Validando se encontrou registro de avaliação para este usuário
			console.log(studTest);
			if (studTest.length > 0){
				
				//Busca os dados das questões da avaliação
				testModel.findById(req.body._id)
				.populate({ path: 'questions.id' })				
				.exec(function(err, test){
					if (test){
						var qtemp = test.questions;						
						//Verificar se o aluno acertou a última questão respondida
						answered = studTest[0].questionsAnswered;
						var lastQuestion = answered[answered.length-1];
						
						//Procurando a questão respondida
						questionModel.findById(lastQuestion)						
						.exec(function(err, question){							
							var rightAnswer = false;
							var lastAnswer = studTest[0].answers[studTest[0].answers.length-1];
							for (var i = 0; i < question.answers.length; i++) {								
								if (question.answers[i]._id == lastAnswer &&
									question.answers[i].rightAnswer){
									rightAnswer = true;
									break;
								}
							}
							//Remoção das questões já respondidas
							//As questões não respondidas serão avaliadas pelo seletor de questões
							var questionsAns = studTest[0].questionsAnswered;
							for (var i = qtemp.length-1 ; i > -1; i--){
								for (var j = 0; j < questionsAns.length; j++){									
									if (questionsAns[j].toString() == qtemp[i].id._id.toString()){
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
								studTest[0].questionsAnswered.push(question.id._id);
								studTest[0].save();
								res.send(question.id);
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

router.post('/', function(req, res, next) {		
	if (req.body.name && req.body.date){
		var test = new testModel();
		test.name = req.body.name;
		test.date = req.body.date;
		for(var i = 0; i < req.body.questions.length; i++){
			test.questions.push(req.body.questions[i]);
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

module.exports = router;