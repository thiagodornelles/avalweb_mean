var testModel = require('../models/testsModel');
var studentTestModel = require('../models/studentTestsModel');
var questionModel = require('../models/questionsModel');
var categoryModel = require('../models/categoriesModel');

var BalanceStrategy = function(){	
	this.nextQuestion = function(answer, questions){
		// console.log(answer);
		//Teste iniciando... Seleciona uma questão difícil
		if(answer === ''){
			//Ordenando pela dificuldade, retorna a mais difícil
			questions.sort(function(a, b){
				return b.difficulty - a.difficulty;
			});			
			console.log("Iniciando");
			console.log(questions[0]);			
			return questions[0];
		}		
		//Acertou a última questao
		else if(answer){
			//Ordenando pela dificuldade, retorna a mais difícil			
			questions.sort(function(a, b){
				return b.difficulty - a.difficulty;
			});			
			console.log("Questao mais dificil");
			console.log(questions[0]);
			return questions[0];
		}
		else if(!answer){
			//Ordenando pela dificuldade, retorna a mais fácil			
			questions.sort(function(a, b){				
				return a.difficulty - b.difficulty;
			});			
			console.log("Questao mais facil");
			console.log(questions[0]);
			return questions[0];
		}		
		return questions[0];
	}
};

module.exports = BalanceStrategy;