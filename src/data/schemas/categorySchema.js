const { Schema } = require('mongoose');
//대분류 스키마
const categorySchema = new Schema({
    categoryNum: {
        type: Number,
        required: true,
    },
    categoryName: {
        type: String,
        required: true,
    },
});

module.exports = categorySchema;
