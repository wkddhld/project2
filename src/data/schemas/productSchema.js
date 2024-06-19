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
      required: false,
    },
    information: {
      type: String,
      required: false,
      default: '',
    },
    origin: {
      type: String,
      required: false,
      default: '',
    },
    image: {
      type: String,
      required: true,
    },
    categoryNumber: {
      type: Number,
      required: true,
    },
    subCategoryNumber: {
      type: Number,
      required: true,
    },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.virtual('category', {
  ref: 'categories',
  localField: 'categoryNumber',
  foreignField: 'number',
});

productSchema.virtual('subCategory', {
  ref: 'subcategories',
  localField: 'subCategoryNumber',
  foreignField: 'number',
});

module.exports = productSchema;
