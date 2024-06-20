const mongoose = require('mongoose');

const { guestSchema } = require('../schemas');

module.exports = mongoose.model('guests', guestSchema);
