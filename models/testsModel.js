
var mongoose = require('mongoose');

var testSchema = new mongoose.Schema({
	name : String,
	date : Date,	
	questions : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
	categories : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
	strategy : String,
	type: Number
});

module.exports = mongoose.model('Test', testSchema);