const { Schema } = require('mongoose');
//주문정보 스키마
const orderSchema = new Schema(
    {
        number: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        receiverAddress: {
            type: [String],
            required: true,
        },
        receiverName: {
            type: String,
            required: true,
        },
        receiverPhoneNumber: {
            type: String,
            required: true,
        },
    },
    {
        versionKey: false,
    }
);

module.exports = orderSchema;
