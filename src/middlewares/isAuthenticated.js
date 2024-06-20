const jwt = require('jsonwebtoken');

const isAuthenticatedMiddleware = (
  req,
  res,
  next,
) => {
  const { userCookies, adminCookies } =
    req.cookies;
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
    jwt.verify(
      token,
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
    // 비회원인 경우
    const err = new Error(
      '인증되지 않은 사용자입니다.',
    );
    err.statusCode = 401;
    return next(err);
  }
};

module.exports = isAuthenticatedMiddleware;
