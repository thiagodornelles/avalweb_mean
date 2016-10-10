var mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({
	name: String,
	questions : [{
		priority: Number,		
		id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }
	}],
	subCategories : [{
		id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category'}
	}],
	superCategory: String
});

module.exports = mongoose.model('Category', categorySchema);