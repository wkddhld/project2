const { Schema } = require('mongoose');
const fileSchema = new Schema({
    filename: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    originalName: {
        type: String,
        required: true,
    },
});

module.exports = fileSchema;
