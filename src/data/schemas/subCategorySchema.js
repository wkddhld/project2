const { Schema } = require('mongoose');
// 소분류 카테고리 스키마
const subCategorySchema = new Schema({
    categoryNum: {
        type: Number,
        required: true,
    },
    categoryName: {
        type: String,
        required: true,
    },
    mainCategoryNumber: {
        type: Number,
        required: true,
    },
});

module.exports = subCategorySchema;
