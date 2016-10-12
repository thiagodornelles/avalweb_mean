var StudentTestUtil = function(){    
    this.questions = new Array();    
};

StudentTestUtil.prototype = {
    getQuestionsFromCategory: function(category){
		var questions = new Array();
		//Juntando as questões em um único array (category.questions)
		for (var i = 0; i < category.subCategories.length; i++) {
			var subs = category.subCategories[i].subCategories;										
			for (var j = 0; j < subs.length; j++) {
				questions = questions.concat(subs[j].questions);
			}
			questions = questions.concat(category.subCategories[i].questions);
		}
		return questions;
	}
};

module.exports = StudentTestUtil;