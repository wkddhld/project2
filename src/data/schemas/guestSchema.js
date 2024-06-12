const { Schema } = require('mongoose');

const guestSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        orderNumber: {
            type: Number,
            required: false,
        },
    },
    {
        versionKey: false,
    }
);

module.exports = guestSchema;
