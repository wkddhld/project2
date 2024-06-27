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
      default: Date.now,
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
          productName: {
            type: String,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
    },

    orderState: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  },
);
module.exports = orderSchema;
