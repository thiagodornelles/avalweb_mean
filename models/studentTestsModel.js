var mongoose = require('mongoose');

var studentTestSchema = new mongoose.Schema({
	user: String,
	test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
	date: Date,
	active: Boolean,	
	questionsAnswered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
	answers: [mongoose.Schema.Types.ObjectId]
});

module.exports = mongoose.model('StudentTest', studentTestSchema);