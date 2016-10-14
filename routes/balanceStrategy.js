var testModel        = require('../models/testsModel');
var studentTestModel = require('../models/studentTestsModel');
var questionModel    = require('../models/questionsModel');
var categoryModel    = require('../models/categoriesModel');

var BalanceStrategy = function(){	
	this.nextQuestion = function(answer, questions, anyData){		
		console.log(anyData);
		//Teste iniciando... Seleciona uma questão difícil
		if(answer === ''){
			//Ordenando pela dificuldade, retorna a mais difícil
			questions.sort(function(a, b){
				return b.difficulty - a.difficulty;
			});			
			// console.log("Iniciando");
			// console.log(questions[0]);			
			return questions[0];
		}		
		//Acertou a última questao
		else if(answer){
			//Ordenando pela dificuldade, retorna a mais difícil			
			questions.sort(function(a, b){
				return b.difficulty - a.difficulty;
			});			
			// console.log("Questao mais dificil");
			// console.log(questions[0]);
			return questions[0];
		}
		else if(!answer){
			//Busca registro mais atual do estado de execução da avaliação
			studentTestModel.find({
				'user': anyData.user,
				'test': anyData.test
			})
			.limit(1).sort({ 'date': -1 })
			.exec(function (err, studTest) {
				//Uma nova tentativa em caso de erro da questao da categoria
				if (studTest[0].numberRetries < 1){
					//Repete mais uma questão da categoria
					studTest[0].actualCategory--;
					studTest[0].numberRetries++ ;
					studTest[0].save();
				}
				else{
					studTest[0].numberRetries = 0; 
					studTest[0].save();
				}
				//Ordenando pela dificuldade, retorna a mais fácil			
				questions.sort(function(a, b){				
					return a.difficulty - b.difficulty;
				});
				// console.log("Questao mais facil");
				// console.log(questions[0]);
				return questions[0]; 
			});			
		}	
		return questions[0];
	}
};

module.exports = BalanceStrategy;