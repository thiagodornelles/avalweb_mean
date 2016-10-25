var mongoose = require('mongoose');

var studentTestSchema = new mongoose.Schema({
	user: String,
	student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, 
	test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },	
	date: Date,
	finished: Boolean,	
	answeredQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
	answeredCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
	answers: [mongoose.Schema.Types.ObjectId],
	answersGrade: [Number],
	categoriesToAnswer: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
	repeatedCategory: [Boolean],			
	actualCategory: Number,
	numberRetries: Number
});

module.exports = mongoose.model('StudentTest', studentTestSchema);