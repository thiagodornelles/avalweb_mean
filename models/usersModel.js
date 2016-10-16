var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	userName : String,
	type: Number,
    password: String
});

module.exports = mongoose.model('User', userSchema);