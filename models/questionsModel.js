var mongoose = require('mongoose');

var questionSchema = new mongoose.Schema({
	wording : String,
	media : Buffer,
	subject : String,
	answers : [{
		answer : String,
		feedback: String,
		rightAnswer: Boolean
	}],
	difficulty : Number,
	caseRight : Number,
	caseWrong : Number
});

module.exports = mongoose.model('Question', questionSchema);