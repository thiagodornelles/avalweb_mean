var mongoose = require('mongoose');

var studentTestSchema = new mongoose.Schema({
	user: String,
	test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
	date: Date,
	finished: Boolean,	
	answeredQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
	answeredCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
	answers: [mongoose.Schema.Types.ObjectId],
	actualCategory: Number,
	numberRetries: Number
});

module.exports = mongoose.model('StudentTest', studentTestSchema);