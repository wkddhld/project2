require('dotenv').config({ path: '../.env' });
const express = require('express');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
    console.log('DB와 연결되었습니다😄');
});

mongoose.connection.on('disconnected', () => {
    console.log('DB와 연결이 끊어졌습니다🥲');
});

mongoose.connection.on('error', () => {
    console.log('⚠️ DB와 연결 과정에서 오류가 발생하였습니다.');
    console.log(process.env.MONGODB_URI);
});

const app = express();
app.use('/api/v1', (req, res) => {
    res.send('root page');
});

app.listen(7008, () => {
    console.log('PORT 7008과 연결되었습니다😊');
});
