const { Schema } = require('mongoose');
//대분류 스키마
const categorySchema = new Schema(
    {
        number: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
    },
    {
        versionKey: false,
    }
);

module.exports = categorySchema;
