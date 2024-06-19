const { Schema } = require('mongoose');
// 소분류 카테고리 스키마
const subCategorySchema = new Schema(
  {
    number: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    mainCategoryNumber: {
      type: Number,
      required: true,
    },
  },
  {
    // _안나옴(_v1)
    versionKey: false,
  },
);

module.exports = subCategorySchema;
