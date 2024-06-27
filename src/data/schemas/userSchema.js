const { Schema } = require('mongoose');

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: [String],
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: false,
      default: false,
    },
    isUser: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    versionKey: false,
  },
);

module.exports = userSchema;
