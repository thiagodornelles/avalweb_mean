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
 
    nextQuestion: function(answer, questions){
        return this.strategy.nextQuestion(answer, questions);
    }
};

// var DefaultStrategy = function(){   
//     this.nextQuestion = function(answer, questions){
//         return answer + questions;
//     }
// };

// var NiceStrategy = function(){  
//     this.nextQuestion = function(answer, questions){
//         return answer + questions.reverse();
//     }
// };

module.exports = TestStrategy;
// var def = new DefaultStrategy();
// var nice = new NiceStrategy();
// var test = new TestStrategy();
// // test.setQuestions([1,2,3]);
// test.setStrategy(def);
// alert(test.nextQuestion('oi', [1,2,3]));
// test.setStrategy(nice);
// alert(test.nextQuestion('oi', [1,2,3]));