const { Schema } = require('mongoose');

const userSchema = new Schema({
    userEmail: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    userPw: {
        type: String,
        required: true,
    },
    userAddr: {
        type: Array,
        required: true,
    },
    userPhone: {
        type: Number,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        required: false,
        default: false,
    },
    orderNum: {
        type: Number,
        required: false,
    },
});

module.exports = userSchema;
