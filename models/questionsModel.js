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
	category: String
});

module.exports = mongoose.model('Question', questionSchema);