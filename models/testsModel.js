var mongoose = require('mongoose');

var testSchema = new mongoose.Schema({
	name : String,
	date : Date,	
	questions : [{
		priority: Number,		
		id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }
	}],
	strategy : String
});

module.exports = mongoose.model('Test', testSchema);