const mongoose = require('mongoose');
const { imageSchema } = require('../schemas');

module.exports = mongoose.model('images', imageSchema);
