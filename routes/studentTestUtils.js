var StudentTestUtil = function(){    
    this.questions = new Array();    
};

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}
StudentTestUtil.prototype = {
    getQuestionsFromCategory: function(category){
		var questions = new Array();
		//Juntando as questões em um único array
		if(category){
			for (var i = 0; i < category.subCategories.length; i++) {
				var subs = category.subCategories[i].subCategories;										
				for (var j = 0; j < subs.length; j++) {			
					questions = questions.concat(subs[j].questions);				
				}			
				questions = questions.concat(category.subCategories[i].questions);
			}
			questions = questions.concat(category.questions);
			questions.reverse();		
		}
		return questions;
	}
};

module.exports = StudentTestUtil;