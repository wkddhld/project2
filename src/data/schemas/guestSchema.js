const { Schema } = require('mongoose');

const guestSchema = new Schema({
    gEmail: {
        type: String,
        required: true,
    },
    gName: {
        type: String,
        required: true,
    },
    gPw: {
        type: String,
        required: true,
    },
    gPhone: {
        type: Number,
        required: true,
    },
    orderNum: {
        type: Number,
        required: false,
    },
});

module.exports = guestSchema;
