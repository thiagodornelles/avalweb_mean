var mongoose = require('mongoose');

var studentSchema = new mongoose.Schema({
	name : String,
	birthDate : Date,
	photo : Buffer
});

module.exports = mongoose.model('Student', studentSchema);