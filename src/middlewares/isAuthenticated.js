const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const isAuthenticatedMiddleware = (req, res, next) => {
    cookieParser()(req, res, () => {
        const { userCookies, adminCookies } = req.cookies;
        // req.cookies에 userCookies or adminCookies가 있으면 회원 or 관리자
        // 없으면 비회원
        if (userCookies || adminCookies) {
            let token;
            if (userCookies) {
                token = userCookies;
            } else {
                token = adminCookies;
            }
            // token(userCookies or adminCookies)이 유효한지 판단하는 로직
            jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    const err = new Error('토큰이 유효하지 않습니다.');
                    err.statusCode = 403;
                    next(err);
                    return;
                }
                next();
            });
        } else {
            // 비회원인 경우
            const err = new Error('인증되지 않은 사용자입니다.');
            err.statusCode = 401;
            next(err);
            return;
        }
    });
};

module.exports = isAuthenticatedMiddleware;
