const mongoose = require('mongoose');
const { guestSchema } = require('../schemas');

module.exports = mongoose.model('guest', guestSchema);
