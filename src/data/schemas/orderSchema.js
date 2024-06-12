const { Schema } = require('mongoose');
//주문정보 스키마
const orderSchema = new Schema(
    {
        number: {
            type: Number,
            required: true,
        },
        name: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        address: {
            type: [String],
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        products: {
            type: [{ String, Number, Number }], // [{상품명, 상품갯수, 상품가격}]
            required: true,
        },

        orderState: {
            type: Boolean,
            required: true,
        },
    },
    {
        versionKey: false,
    }
);

module.exports = orderSchema;
