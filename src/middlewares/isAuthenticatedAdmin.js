const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// 관리자인지 확인하는 미들웨어
const isAuthenticatedAdminMiddleware = (req, res, next) => {
    cookieParser()(req, res, () => {
        // req.cookies에 adminCookies가 있으면 관리자, 없으면 관리자 아님
        if (req.cookies.adminCookies) {
            // jwt 토큰을 decoding해서 거기서 isAdmin을 찾아서 로직 짜야함(디코딩 안되면 접근 오류)
            jwt.verify(req.cookies.adminCookies.jwtToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    const err = new Error('토큰이 유효하지 않습니다.');
                    err.statusCode = 403;
                    next(err);
                    return;
                }
                next();
            });
        } else {
            const err = new Error('인증되지 않은 관리자입니다.');
            err.statusCode = 401;
            next(err);
            return;
        }
    });
};

module.exports = isAuthenticatedAdminMiddleware;
