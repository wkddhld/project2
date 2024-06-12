const mongoose = require('mongoose');
const { subCategorySchema } = require('../schemas');

module.exports = mongoose.model('subCategories', subCategorySchema);
