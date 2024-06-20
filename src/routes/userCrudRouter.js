const express = require('express');

const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { User } = require('../data');

// 토큰확인 함수
const verifyToken = (token, secretKey) => {
  try {
    return jwt.verify(token, secretKey);
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      const err = new Error('토큰이 만료되었습니다. 다시 로그인 해주세요.');
      err.statusCode = 401;
      throw err;
    }
    if (e.name === 'JsonWebTokenError') {
      const err = new Error('유효하지 않거나 손상된 토큰입니다. 다시 로그인 해주세요.');
      err.statusCode = 401;
      throw err;
    }
    throw e; // 다른 예기치 않은 에러
  }
};

// 사용자 정보 조회
router.get('/', async (req, res, next) => {
  try {
    const { adminCookies, tempCookies } = req.cookies;

    // 관리자인 경우
    if (adminCookies) {
      const err = new Error('접근 권한이 없습니다.');
      err.statusCode = 403;
      return next(err);
    }

    // 비밀번호 재확인 쿠키가 존재하지 않는 경우
    if (!tempCookies) {
      const err = new Error('비밀번호 재확인이 필요합니다.');
      err.statusCode = 401;
      return next(err);
    }

    // 비밀번호 재확인 토큰 확인
    verifyToken(tempCookies, process.env.CONFIRM_JWT_SECRET_KEY);

    const user = await User.findById(res.locals.user._id).lean();

    // 유저가 존재하지 않을경우
    if (!user) {
      const err = new Error('해당 유저를 찾을 수 없습니다.');
      err.statusCode = 404;
      return next(err);
    }

    // 비밀번호 재확인 쿠키 제거
    res.clearCookie('tempCookies');

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

// 사용자 정보 수정
router.put('/', async (req, res, next) => {
  try {
    // 쿠키의 userID
    const { adminCookies } = req.cookies;
    const {
      name,
      email,
      password,
      confirmPassword,
      postNumber,
      address,
      detailAddress,
      phoneNumber,
    } = req.body;

    // 관리자인 경우
    if (adminCookies) {
      const err = new Error('접근 권한이 없습니다.');
      err.statusCode = 403;
      return next(err);
    }

    const user = await User.findById(res.locals.user._id).lean();

    // 유저가 존재하지 않을 경우
    if (!user) {
      const err = new Error('해당 유저를 찾을 수 없습니다.');
      err.statusCode = 404;
      return next(err);
    }

    // name이 string type이 아니거나 빈 값일 경우
    if (typeof name !== 'string' || name === '' || name.trim() === '') {
      const err = new Error('이름은 문자열이며 빈 값이 아니어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 비밀번호 길이가 8글자 미만이거나 영문자 또는 숫자 또는 특수문자 포함 안 됐을 경우
    if (
      password.length < 8 ||
      password.search(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/) === -1
    ) {
      const err = new Error('비밀번호 양식이 맞지 않습니다.');
      err.statusCode = 400;
      return next(err);
    }

    // password와 confirmPassword 불일치 할 경우
    if (password !== confirmPassword) {
      const err = new Error('비밀번호가 일치하지 않습니다.');
      err.statusCode = 400;
      return next(err);
    }

    // phoneNumber가 string type이 아니거나 빈 값일 경우
    if (typeof phoneNumber !== 'string' || phoneNumber === '' || phoneNumber.trim() === '') {
      const err = new Error('전화번호는 문자열이며 빈 값이 아니어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // address가 string type이 아니거나 빈 값일 경우
    if (
      typeof postNumber !== 'string' ||
      postNumber === '' ||
      postNumber.trim() === '' ||
      typeof address !== 'string' ||
      address === '' ||
      address.trim() === '' ||
      typeof detailAddress !== 'string' ||
      detailAddress === '' ||
      detailAddress.trim() === ''
    ) {
      const err = new Error('주소는 문자열이며 빈 값이 아니어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    const hashPassword = await bcrypt.hash(password, 10);

    // 요청에서 수정 할 데이터 선언
    const data = {
      _id: res.locals.user._id,
      name,
      email,
      password: hashPassword,
      phoneNumber,
      address: [postNumber, address, detailAddress],
    };

    // DB에 데이터 저장
    await User.updateOne({ _id: res.locals.user._id }, data);

    // 수정한 데이터를 바탕으로 토큰 새로 만들어줌
    const newJsonToken = jwt.sign(
      {
        _id: res.locals.user._id,
        email: data.email,
        phoneNumber: data.phoneNumber,
      },
      process.env.USER_JWT_SECRET_KEY,
      { expiresIn: '1h' },
    );

    res
      .status(201)
      .cookie('userCookies', newJsonToken, { httpOnly: true, secure: true })
      .json({
        err: null,
        data: {
          name: data.name,
          email: data.email,
          address: data.address,
          phoneNumber: data.phoneNumber,
        },
      });
  } catch (e) {
    next(e);
  }
});

// 회원 탈퇴
router.put('/withdrawal', async (req, res, next) => {
  try {
    // 쿠키의 userID
    const { adminCookies } = req.cookies;

    // 관리자인 경우
    if (adminCookies) {
      const err = new Error('접근 권한이 없습니다.');
      err.statusCode = 403;
      return next(err);
    }

    // decode해서 얻은 payload에서 _id로 해당 유저 찾음
    const user = await User.findById(res.locals.user._id).lean();

    if (user === null || user === undefined) {
      const err = new Error('유저를 찾을 수 없습니다.');
      err.statusCode = 404;
      return next(err);
    }

    await User.updateOne({ _id: user._id }, { isUser: false });
    res.clearCookie('userCookies');
    res.json({ err: null, data: { message: '탈퇴되었습니다.' } });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
