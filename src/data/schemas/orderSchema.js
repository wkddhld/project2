const { Schema } = require('mongoose');
//주문정보 스키마
const orderSchema = new Schema(
    {
        number: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
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
        // [{상품명, 상품갯수, 상품가격}]
        products: {
            type: [
                {
                    name: {
                        type: String,
                        required: true,
                    },
                    quantity: {
                        type: String,
                        required: true,
                    },
                    price: {
                        type: String,
                        required: true,
                    },
                },
            ],
            required: true,
        },

        orderState: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        versionKey: false,
    }
);
module.exports = orderSchema;
