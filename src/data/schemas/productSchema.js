const { Schema } = require('mongoose');

const productSchema = new Schema({
    productNum: {
        type: Number,
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    productPrice: {
        type: Number,
        required: true,
    },
    productStock: {
        type: Number,
        required: true,
    },
    productInfo: {
        type: String,
        required: false,
    },
    productOrigin: {
        type: String,
        required: false,
    },
    productImg: {
        type: Blob,
        required: true,
    },
    categoryNum: {
        type: Number,
        required: true,
    },
    sCateogryNum: {
        type: Number,
        required: true,
    },
});

module.exports = productSchema;
