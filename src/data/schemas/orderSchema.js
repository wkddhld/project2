const { Schema } = require('mongoose');
//주문정보 스키마
const orderSchema = new Schema({
    orderNum: {
        type: Number,
        required: true,
    },
    orderDate: {
        type: Date,
        required: true,
    },
    receiveAddr: {
        type: String,
        required: true,
    },
    receiveName: {
        type: String,
        required: true,
    },
    receivePhone: {
        type: Number,
        required: true,
    },
});

module.exports = orderSchema;