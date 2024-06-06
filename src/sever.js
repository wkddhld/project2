require('dotenv').config({ path: '../.env' });
const express = require('express');
const mongoose = require('mongoose');
const router  = express.Router();
const cors = require('cors');
const categoryRouter = require('./routers/categoryRouter');
const signinRouter = require('./routers/signinRouter');
const app = express();

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



// 대카테고리 라우터
app.use(categoryRouter);


//루트 url 경로 정의
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


//기타 api 경로 정의
app.use('/api/v1', (req, res) => {
    res.send('root page');
});

app.listen(7008, () => {
    console.log('PORT 7008과 연결되었습니다😊');
});


