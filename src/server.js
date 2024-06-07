require('dotenv').config({ path: '../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { signupRouter, signinRouter, homeRouter, productRouter, categoryRouter, signinRouter } = require('./routes');

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

app.use(cors());
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', homeRouter);

app.use('/api/signup', signupRouter);

app.use('/api/products', productRouter);

// 대카테고리 라우터
app.use(categoryRouter);
// //루트 url 경로 정의
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.listen(7008, () => {
    console.log('PORT 7008과 연결되었습니다😊');
});
