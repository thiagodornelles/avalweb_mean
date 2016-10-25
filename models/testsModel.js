var mongoose = require('mongoose');

var testSchema = new mongoose.Schema({
	name : String,
	date : Date,	
	questions : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
	categories : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
	classes : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
	strategy : String,
	type: Number,
	owner: String
});

module.exports = mongoose.model('Test', testSchema);