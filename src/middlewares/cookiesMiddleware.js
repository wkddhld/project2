const cookieParser = require('cookie-parser');
const crypto = require('crypto');

// 요청 들어왔을 때마다 쿠키 가지고 있는지 check하는 미들웨어
const cookiesMiddleware = (req, res, next) => {
    cookieParser()(req, res, () => {
        // 쿠키가 없으면 쿠키 생성 후 다음 미들웨어로
        // 있으면 바로 다음 미들웨어로
        if (!req.cookies) {
            let sessionId = crypto.randomUUID(); // 랜덤으로 세션 id 생성
            res.cookie('guestCookies', encodeURIComponent(sessionId), {
                httpOnly: true,
                secure: true,
                domain: 'localhost',
            });
        }
        next();
    });
};

module.exports = cookiesMiddleware;
