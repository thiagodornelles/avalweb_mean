var mongoose = require('mongoose');

var classSchema = new mongoose.Schema({
	name : String,	
	students : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
	owner: String
});

module.exports = mongoose.model('Class', classSchema);