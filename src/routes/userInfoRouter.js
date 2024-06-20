const express = require('express');

const router = express.Router();
const { User } = require('../data');

// 사용자 정보 조회
router.get('/', async (req, res, next) => {
  try {
    // 쿠키의 userID
    const { adminCookies } = req.cookies;
    // 관리자인 경우
    if (adminCookies) {
      const err = new Error('접근 권한이 없습니다.');
      err.statusCode = 403;
      return next(err);
    }

    const user = await User.findById(res.locals.user._id).lean();

    // 유저가 존재하지 않을경우
    if (user === null || user === undefined) {
      const err = new Error('해당 유저를 찾을 수 없습니다.');
      err.statusCode = 404;
      return next(err);
    }

    // 4가지 user정보 반환(이름, 이메일, 주소, 전화번호)
    res.json({
      err: null,
      data: {
        name: user.name,
        email: user.email,
        address: user.address,
        phonenumber: user.phoneNumber,
      },
    });
  } catch (e) {
    // 서버 에러가 났을 경우
    next(e);
  }
});

module.exports = router;
