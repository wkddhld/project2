const jwt = require('jsonwebtoken');

// 관리자인지 확인하는 미들웨어
const isAuthenticatedAdminMiddleware = (req, res, next) => {
  // req.cookies에 adminCookies가 있으면 관리자, 없으면 관리자 아님
  if (req.cookies.adminCookies) {
    // jwt 토큰을 decoding해서 거기서 isAdmin을 찾아서 로직 짜야함(디코딩 안되면 접근 오류)
    jwt.verify(
      req.cookies.adminCookies,
      process.env.USER_JWT_SECRET_KEY,
      (err, decoded) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            const err = new Error(
              '토큰이 만료되었습니다. 다시 로그인 해주세요.',
            );
            err.statusCode = 401;
            return next(err);
          }
          if (err.name === 'JsonWebTokenError') {
            const err = new Error(
              '유효하지 않거나 손상된 토큰입니다. 다시 로그인 해주세요.',
            );
            err.statusCode = 401;
            return next(err);
          }
        }
        res.locals.user = decoded;
        next();
      },
    );
  } else {
    const err = new Error('관리자가 아닙니다.');
    err.statusCode = 401;
    return next(err);
  }
};

module.exports = isAuthenticatedAdminMiddleware;
