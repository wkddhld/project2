const { Schema } = require('mongoose');

const productSchema = new Schema(
    {
        number: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        stock: {
            type: Number,
            required: true,
        },
        information: {
            type: String,
            required: false,
        },
        origin: {
            type: String,
            required: false,
        },
        image: {
            type: Buffer,
            required: true,
        },
        categoryNumber: {
            type: Number,
            required: true,
        },
        subCateogryNumber: {
            type: Number,
            required: true,
        },
    },
    {
        versionKey: false,
    }
);

module.exports = productSchema;