var mongoose = require('mongoose');

var testSchema = new mongoose.Schema({
	name : String,
	date : Date,	
	questions : [{
		priority: Number,		
		id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }
	}],
	categories : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
	strategy : String
});

module.exports = mongoose.model('Test', testSchema);