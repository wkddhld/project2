const mongoose = require('mongoose');
const { sCategorySchema} = require('../schemas');

module.exports = mongoose.model('sCategory', sCategorySchema);
