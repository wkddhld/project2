const express = require('express');

const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User, Guest, Order } = require('../data');
const { isAuthenticatedMiddleware } = require('../middlewares');

// 회원가입 api
router.post('/sign-up', async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phoneNumber,
      postNumber,
      address,
      detailAddress,
      agreement,
    } = req.body;

    // name이 string type이 아니거나 빈 값일 경우 에러 핸들러로 에러 넘김
    if (typeof name !== 'string' || name === '' || name.trim() === '') {
      const err = new Error('이름은 문자열이며 빈 값이 아니어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // email이 string type이 아니거나 빈 값일 경우
    if (typeof email !== 'string' || email === '' || email.trim() === '') {
      const err = new Error('이메일은 문자열이며 빈 값이 아니어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // email이 '@'를 포함하지 않거나 ".com" or ".net"으로 끝나지 않는 경우
    if (!email.includes('@') || email.search('.(com|net)$') === -1) {
      const err = new Error('이메일 형식과 맞지 않습니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 이메일 중복 체크
    const foundEmail = await User.findOne({
      email,
    }).lean();

    // foundEmail이 존재한다면
    if (foundEmail !== null) {
      const err = new Error('이미 존재하는 email입니다.');
      err.statusCode = 400;
      return next(err); // 매우 중요.  return 해주지 않을 경우 response가 간 다음에도 이후 코드들이 실행됨
    }

    // password가 string type이 아니거나 빈 값일 경우
    if (typeof password !== 'string' || password === '') {
      const err = new Error('비밀번호는 문자열이며 빈 값이 아니어야 합니다.');
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

    // agreement가 false인 경우
    if (!agreement) {
      const err = new Error('이용 약관에 동의가 필요합니다.');
      err.statusCode = 400;
      return next(err);
    }

    const hashPassword = await bcrypt.hash(password, 10); // 전달 받은 비밀번호 해시화

    // 유저 데이터 db에 저장하기
    const data = await User.create({
      name,
      email,
      password: hashPassword,
      phoneNumber,
      address: [postNumber, address, detailAddress],
    });

    res.status(201).json({
      err: null,
      data: {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
      },
    });
  } catch (e) {
    next(e);
  }
});

// 이메일 중복 체크하는 로직
router.post('/sign-up/check-email', async (req, res, next) => {
  try {
    const { email } = req.body;

    // email이 string type이 아니거나 빈 값일 경우
    if (typeof email !== 'string' || email === '' || email.trim() === '') {
      const err = new Error('이메일은 문자열이거나 빈 값이 아니어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // email이 '@'를 포함하지 않거나 ".com" or ".net"으로 끝나지 않는 경우
    if (!email.includes('@') || email.search('.(com|net)$') === -1) {
      const err = new Error('이메일 형식과 맞지 않습니다.');
      err.statusCode = 400;
      return next(err);
    }

    // user 데이터에서 req.body로 받은 이메일과 일치하는 사용자가 있는지 확인
    const foundEmail = await User.findOne({
      email,
    }).lean();

    // foundEmail이 존재한다면
    if (foundEmail !== null) {
      const err = new Error('이미 존재하는 email입니다.');
      err.statusCode = 400;
      return next(err); // 매우 중요.  return 해주지 않을 경우 response가 간 다음에도 이후 코드들이 실행됨
    }

    res.json({ err: null, data: email });
  } catch (e) {
    next(e);
  }
});

// 회원 로그인 api
router.post('/sign-in', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 이메일이 string 값이 아니거나 빈 값일 때
    if (typeof email !== 'string' || email === '' || email.trim() === '') {
      const err = new Error('이메일은 문자열이며 빈 값이 될 수 없습니다.');
      err.statusCode = 400;
      return next(err);
    }

    // email이 '@'를 포함하지 않거나 ".com" or ".net"으로 끝나지 않는 경우
    if (!email.includes('@') || email.search('.(com|net)$') === -1) {
      const err = new Error('이메일 형식과 맞지 않습니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 비밀번호가 string 값이 아니거나 빈 값일 때
    if (typeof password !== 'string' || password === '' || password.trim() === '') {
      const err = new Error('비밀번호는 문자열이며 빈 값이 될 수 없습니다.');
      err.statusCode = 400;
      return next(err);
    }

    // req.body로 받은 email이 DB에 저장된 email과 일치하는 데이터 하나만 찾음
    const foundData = await User.findOne({
      email,
    }).lean();
    if (foundData === null) {
      const err = new Error('이메일이나 비밀번호가 일치하지 않습니다.');
      err.statusCode = 400;
      return next(err);
    }

    // req.body로 받은 password와 DB에 저장된 password와 일치하면 true, 불일치하면 false 반환
    const isPassword = await bcrypt.compare(password, foundData.password);
    if (!isPassword) {
      const err = new Error('이메일이나 비밀번호가 일치하지 않습니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 탈퇴한 사용자인 경우
    if (foundData.isUser === false) {
      const err = new Error('탈퇴한 사용자입니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 토큰 생성(이메일, 전화번호만 담김)
    const jwtToken = jwt.sign(
      {
        _id: foundData._id,
        email: foundData.email,
        phoneNumber: foundData.phoneNumber,
      },
      process.env.USER_JWT_SECRET_KEY,
      { expiresIn: '1h' },
    );

    // 관리자 여부에 따라 쿠키 생성
    if (foundData.isAdmin) {
      // 쿠키에 토큰 담아서 보냄
      return res
        .cookie('adminCookies', jwtToken, {
          httpOnly: true,
        })
        .json({
          err: null,
          data: {
            isAdmin: true,
            message: '로그인에 성공하셨습니다. 환영합니다.',
          },
        });
    } else {
      return res
        .cookie('userCookies', jwtToken, {
          httpOnly: true,
        })
        .json({
          err: null,
          data: {
            isAdmin: false,
            message: '로그인에 성공하셨습니다. 환영합니다.',
          },
        });
    }
  } catch (e) {
    next(e);
  }
});

router.post('/guest/sign-in', async (req, res, next) => {
  try {
    const { orderNumber, password } = req.body;

    if (!Number.isInteger(Number(orderNumber)) || orderNumber.length !== 10) {
      const err = new Error('주문번호는 10자리 숫자이어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 비밀번호가 4자리 숫자가 아닌 경우
    if (password.length !== 4 || password.search(/^\d{4}$/)) {
      const err = new Error('비밀번호는 4자리 숫자이어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 주문 정보 가져옴
    const foundOrder = await Order.findOne({
      number: Number(orderNumber),
    }).lean();

    if (foundOrder === null || foundOrder === undefined) {
      const err = new Error('주문번호나 비밀번호가 일치하지 않습니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 주문을 한 비회원인지 체크하는 코드
    const foundGuest = await Guest.findOne({
      orderNumber: foundOrder._id,
    }).lean();

    const isPassword = await bcrypt.compare(password, foundGuest.password);

    if (!isPassword) {
      const err = new Error('주문번호나 비밀번호가 일치하지 않습니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 수정한 데이터를 바탕으로 토큰 새로 만들어줌
    const token = jwt.sign(
      {
        email: foundGuest.email,
        phoneNumber: foundGuest.phoneNumber,
      },
      process.env.GUEST_JWT_SECRET_KEY,
      { expiresIn: '1h' },
    );

    res
      .cookie('guestCookies', token, {
        httpOnly: true,
      })
      .json({
        err: null,
        message: '인증 성공하였습니다.',
      });
  } catch (e) {
    next(e);
  }
});

// 로그아웃
router.post('/sign-out', isAuthenticatedMiddleware, async (req, res, next) => {
  try {
    // 로그아웃 시 로그인이 된 상태인지 확인 => 미들웨어로
    // 로그아웃 처리 로직
    const { userCookies, adminCookies } = req.cookies; // userCookie 또는 adminCookie 받음

    // userCookies인 경우
    if (userCookies) {
      res.clearCookie('userCookies');
      res.json({
        err: null,
        data: '성공적으로 로그아웃 되었습니다.',
      });
      return;
    }

    // adminCookies인 경우
    if (adminCookies) {
      res.clearCookie('adminCookies');
      res.json({
        err: null,
        data: '성공적으로 로그아웃 되었습니다.',
      });
      return;
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
