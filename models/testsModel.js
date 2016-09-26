var mongoose = require('mongoose');

var testSchema = new mongoose.Schema({
	name : String,
	date : Date,	
	questions : [{
		priority: Number,		
		id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }
	}]
});

module.exports = mongoose.model('Test', testSchema);