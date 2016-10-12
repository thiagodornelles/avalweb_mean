var mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({
	name: String,
	questions : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
	subCategories : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category'}],
	superCategory: String
});

module.exports = mongoose.model('Category', categorySchema);