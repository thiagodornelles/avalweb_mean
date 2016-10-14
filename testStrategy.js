var TestStrategy = function(){    
    this.questions = '';    
};

TestStrategy.prototype = {
    setStrategy: function(strategy){
        this.strategy = strategy;
    },

    setQuestions: function(questions){
        this.questions = questions;
    },
 
    nextQuestion: function(answer, questions, anyData){
        return this.strategy.nextQuestion(answer, questions, anyData);
    }
};

module.exports = TestStrategy;