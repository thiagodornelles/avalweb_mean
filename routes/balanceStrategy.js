var testModel = require('../models/testsModel');
var studentTestModel = require('../models/studentTestsModel');
var questionModel = require('../models/questionsModel');
var categoryModel = require('../models/categoriesModel');
var ObjectId = require('mongoose').Types.ObjectId;
var BalanceStrategy = function () {
	this.nextQuestion = function (answer, questions, anyData) {
		// console.log(anyData);
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
		//Acertou a última questao
		else if (answer) {
			//Ordenando pela dificuldade, retorna a mais difícil			
			questions.sort(function (a, b) {
				return b.difficulty - a.difficulty;
			});
			// console.log("Questao mais dificil");
			// console.log(questions[0]);
			return questions[0];
		}
		else if (!answer) {
			//Busca registro mais atual do estado de execução da avaliação
			studentTestModel.find({
				'user': anyData.session.passport.user.username,
				'test': new ObjectId(anyData.session.passport.user.test)
			})
				.limit(1).sort({ 'date': -1 })
				.exec(function (err, studTest) {
					//Uma nova tentativa em caso de erro da questao da categoria					
					//Repete mais uma questão da categoria
					var actualCat = studTest[0].actualCategory;
					if (!studTest[0].repeatedCategory[actualCat]) {
						studTest[0].categoriesToAnswer.push(studTest[0].categoriesToAnswer[actualCat]);
						studTest[0].repeatedCategory.push(true);
					}
					studTest[0].numberRetries++;
					studTest[0].save(function (err) {
						if (err)
							console.log(err);
					});
				});
			//Ordenando pela dificuldade, retorna a mais fácil			
			questions.sort(function (a, b) {
				return a.difficulty - b.difficulty;
			});
			// console.log("Questao mais facil");
			// console.log(questions[0]);
			return questions[0];
		}
	}
};

module.exports = BalanceStrategy;