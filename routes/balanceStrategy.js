var testModel = require('../models/testsModel');
var studentTestModel = require('../models/studentTestsModel');
var questionModel = require('../models/questionsModel');
var categoryModel = require('../models/categoriesModel');
var ObjectId = require('mongoose').Types.ObjectId;
var async = require('async');

var BalanceStrategy = function () {
	this.nextQuestion = function (answer, questions, anyData) {
		var req = anyData.req;
		var studTest = anyData.studTest;
		if(studTest)
			var actualCat = studTest.actualCategory;
		//Teste iniciando... Seleciona uma questão difícil
		if (answer === '') {
			//Ordenando pela dificuldade, retorna a mais difícil
			questions.sort(function (a, b) {
				return b.difficulty - a.difficulty;
			});
			// console.log("Iniciando");
			// console.log(questions[0]);			
			return questions[0];
		}
		else if (answer) {			
			//Se a atual está sendo repetida então envia questão mais fácil
			if (studTest.repeatedCategory[actualCat]) {
				//Ordenando pela dificuldade, retorna a mais fácil			
				questions.sort(function (a, b) {
					return a.difficulty - b.difficulty;
				});
				// console.log("Questao mais facil");
				// console.log(questions[0]);
				return questions[0];
			}
			else {
				questions.sort(function (a, b) {
					return b.difficulty - a.difficulty;
				});
				return questions[0];
			}
		}
		else if (!answer) {
			//Repete mais uma questão da categoria anterior (que foi errada)
			if (!studTest.repeatedCategory[actualCat - 1]) {
				studTest.categoriesToAnswer.push(studTest.categoriesToAnswer[actualCat - 1]);
				studTest.repeatedCategory.push(true);
				studTest.numberRetries++;
			}			
			//Se a atual está sendo repetida então envia questão mais fácil
			if (studTest.repeatedCategory[actualCat]) {
				//Ordenando pela dificuldade, retorna a mais fácil			
				questions.sort(function (a, b) {
					return a.difficulty - b.difficulty;
				});
				// console.log("Questao mais facil");
				// console.log(questions[0]);
				return questions[0];
			}
			else {
				questions.sort(function (a, b) {
					return b.difficulty - a.difficulty;
				});
				return questions[0];
			}
		}
	}
}
module.exports = BalanceStrategy;