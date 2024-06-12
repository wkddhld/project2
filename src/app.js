// ./src/app.js 파일은 express application을 만드는 파일
// server.js 파일은 express application을 구동시키는 파일
// 그렇기 때문에 server.js에 express app을 setup해주는 코드들이 있으면 안 됨
const express = require('express');
const apiRouter = require('./routes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', apiRouter);

// 예외 핸들러(해당되는 URL이 없을 경우)
app.use((req, res, next) => {
    res.status(404).json('해당 페이지를 찾을 수 없습니다.');
});




// 에러 핸들러
app.use((err, req, res, next) => {
    // ?? : Nullish Coalescing Operator로
    // err.statusCode가 null 또는 undefined일 때 500을 반환하고
    // 그렇지 않으면 err.statusCode를 반환
    const statusCode = err.statusCode ?? 500; // 500 이외의 에러는 client의 문제이기 때문에 로그에 남길 필요가 없다. 개발자가 분석을 할 필요가 없기 때문
    if (statusCode === 500) {
        res.status(500).json({ error: '서버 내부에서 에러가 발생하였습니다. 잠시 후 다시 요청바랍니다.', data: null });
        return;
    }
    res.status(statusCode).json(err.message);
});

module.exports = app;
