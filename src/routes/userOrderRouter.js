const express = require('express');

const router = express.Router();
const { customAlphabet } = require('nanoid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const { Order, Guest, User } = require('../data');

// 주문번호 만들기
const numbers = '123456789';
const nanoid = customAlphabet(numbers, 10); // 1-9 랜덤으로 10자리 숫자 만들어주는 코드

function generateNumericOrderNumber() {
  return nanoid();
}

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

//주문조회
router.get('/', async (req, res, next) => {
  try {
    // 쿠키 확인
    const { userCookies, guestCookies } = req.cookies;

    if (!userCookies && !guestCookies) {
      const error = new Error('쿠키가 존재하지 않습니다.');
      error.statusCode = 401;
      return next(error);
    }

    // 사용할 변수 선언
    let decoded;
    if (userCookies) {
      decoded = verifyToken(userCookies, process.env.USER_JWT_SECRET_KEY);
    } else {
      decoded = verifyToken(guestCookies, process.env.GUEST_JWT_SECRET_KEY);
    }

    // 주문번호 검색(이메일 검색)
    const order = await Order.find({
      email: decoded.email,
    }).lean();

    // 주문정보 전송
    res.json({ err: null, data: order });
  } catch (e) {
    next(e);
  }
});

//주문생성
router.post('/', async (req, res, next) => {
  try {
    const {
      products,
      name,
      phoneNumber,
      email,
      postNumber,
      address,
      detailAddress,
      password,
      confirmPassword,
    } = req.body;

    // products가 안 들어왔거나, 배열 형태가 아니거나 상품이 하나도 없을 경우
    if (!products || !Array.isArray(products) || products.length === 0) {
      const err = new Error('존재하지 않는 상품입니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 이름이  string type이 아니거나 빈 값일 경우
    if (typeof name !== 'string' || name === '' || name.trim() === '') {
      const err = new Error('이메일은 문자열이며 빈 값이 아니어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 이메일이  string type이 아니거나 빈 값일 경우
    if (typeof email !== 'string' || email === '' || email.trim() === '') {
      const err = new Error('이메일은 문자열이며 빈 값이 아니어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // email이 '@'를 포함하지 않거나 ".com"으로 끝나지 않는 경우
    if (!email.includes('@') || email.search('.(com|net)$') === -1) {
      const err = new Error('이메일 형식과 맞지 않습니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 전화번호가  string type이 아니거나 빈 값이거나 길이가 11자리가 아닌 경우
    if (
      typeof phoneNumber !== 'string' ||
      phoneNumber === '' ||
      phoneNumber.length !== 11 ||
      phoneNumber.trim() === ''
    ) {
      const err = new Error(
        '전화번호는 문자열이며 빈 값이 아니어야 하고 11자리이어야 합니다.',
      );
      err.statusCode = 400;
      return next(err);
    }

    // 우편번호 string type이 아니거나 빈 값인 경우
    if (typeof postNumber !== 'string' || postNumber === '' || postNumber.trim() === '') {
      const err = new Error('우편번호는 문자열이며 빈 값이 아니어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 도로명 주소가 string type이 아니거나 빈 값인 경우
    if (typeof address !== 'string' || address === '' || address.trim() === '') {
      const err = new Error('도로명 주소는 문자열이며 빈 값이 아니어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 상세 주소가  string type이 아니거나 빈 값인 경우
    if (
      typeof detailAddress !== 'string' ||
      detailAddress === '' ||
      detailAddress.trim() === ''
    ) {
      const err = new Error('상세 주소는 문자열이며 빈 값이 아니어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 쿠키가 없거나 guestCookies 가지고 있으면 비회원
    if (
      (req.cookies && Object.keys(req.cookies).length === 0) ||
      req.cookies.guestCookies
    ) {
      // 주문 작성 시 입력한 이메일이 회원 db에 존재하는 경우
      const foundEmail = await User.findOne({
        email,
      }).lean();
      if (foundEmail !== null) {
        const err = new Error('이미 존재하는 이메일입니다.');
        err.statusCode = 400;
        return next(err);
      }

      // 비밀번호가 숫자값이 아니거나 4자리가 아닌 경우
      if (password.length !== 4 || password.search(/^\d{4}$/)) {
        const err = new Error('비밀번호는 4자리 숫자입니다.');
        err.statusCode = 400;
        return next(err);
      }

      // 비밀번호 일치/불일치 여부 판단
      if (password !== confirmPassword) {
        const err = new Error('입력하신 비밀번호와 일치하지 않습니다.');
        err.statusCode = 400;
        return next(err);
      }

      // 비밀번호 해시화
      const hashPassword = await bcrypt.hash(password, 10);

      // 비회원 주문 정보
      const guestOrderData = {
        products,
        number: Number(generateNumericOrderNumber()),
        name,
        address: [postNumber, address, detailAddress],
        email,
        phoneNumber,
        orderState: '주문완료',
      };

      // 비회원 주문 정보를 주문 DB에 저장
      const newGuestOrder = new Order(guestOrderData);
      await newGuestOrder.save();

      // guest DB에 데이터 저장
      await Guest.create({
        email,
        name,
        password: hashPassword,
        phoneNumber,
        orderNumber: newGuestOrder._id,
      });

      // 생성한 주문번호 이메일로 전송하는 로직
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      let mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `${guestOrderData.name}님에게 보내는 주문번호`,
        text: `회원님의 주문번호는 ${guestOrderData.number}입니다.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return next(error);
        }
      });

      const token = jwt.sign(
        {
          email,
          phoneNumber,
        },
        process.env.GUEST_JWT_SECRET_KEY,
        { expiresIn: '1h' },
      );

      return res
        .cookie('guestCookies', token, {
          httpOnly: true,
          secure: true,
        })
        .status(201)
        .json({
          err: null,
          data: {
            orderNumber: guestOrderData.number,
            message: '주문 완료되었습니다.',
          },
        });
    }
    // data를 db에 저장
    const userData = {
      products,
      number: Number(generateNumericOrderNumber()),
      name,
      address: [postNumber, address, detailAddress],
      email,
      phoneNumber,
      orderState: '주문완료',
    };

    const userOrder = new Order(userData);
    await userOrder.save();

    res.status(201).json({
      err: null,
      data: {
        orderNumber: userData.number,
        message: '주문 완료되었습니다.',
      },
    });
  } catch (e) {
    next(e);
  }
});

//주문 취소
router.put('/:orderNumber', async (req, res, next) => {
  try {
    // 주문 정보 받아오기
    const { orderNumber } = req.params;
    const { guestCookies, userCookies } = req.cookies;

    if (!guestCookies && !userCookies) {
      const err = new Error('접근 권한이 없습니다.');
      err.statusCode = 403;
      return next(err);
    }

    let token;
    if (guestCookies) {
      token = verifyToken(guestCookies, process.env.GUEST_JWT_SECRET_KEY);
    } else {
      token = verifyToken(userCookies, process.env.USER_JWT_SECRET_KEY);
    }

    // 주문번호가 숫자가 아닌 경우
    if (!Number.isInteger(Number(orderNumber))) {
      const err = new Error('해당하는 주문 내역을 찾을 수 없습니다.');
      err.statusCode = 404;
      return next(err);
    }

    // orderNumber가 본인의 주문인지 아닌지 확인하는 절차
    const OrderCheck = await Order.find({
      email: token.email,
    }).lean();

    for (const check of OrderCheck) {
      if (check.number === Number(orderNumber)) {
        try {
          // 이미 취소된 주문인지 체크해주는 코드
          const foundOrder = await Order.findOne({
            number: Number(orderNumber),
          }).lean();
          if (foundOrder.orderState === '주문취소') {
            const err = new Error('이미 취소된 주문입니다.');
            err.statusCode = 400;
            return next(err);
          }

          if (foundOrder.orderState === '배송완료') {
            const err = new Error('배송 완료된 상품이라 주문 취소가 불가합니다.');
            err.statusCode = 400;
            return next(err);
          }

          result = await Order.updateOne(
            { number: Number(orderNumber) },
            { orderState: '주문취소' },
          );

          break; // 주문을 찾았으므로 반복 중단
        } catch (error) {
          next(err);
        }
      }
    }
    res.json({
      err: null,
      data: {
        message: '주문이 취소되었습니다.',
      },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
