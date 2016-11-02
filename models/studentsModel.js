var mongoose = require('mongoose');

var studentSchema = new mongoose.Schema({
	name : String,
	birthDate : Date,
	photo : String,
	email: String	
});

module.exports = mongoose.model('Student', studentSchema);