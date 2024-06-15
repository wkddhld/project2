const express = require('express');
const router = express.Router();
const { User } = require('../data');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// 마이페이지 들어오기 전에 비밀번호 재확인하는 절차 추가해야함
//READ
router.get('/', async (req, res, next) => {
    try {
        // 쿠키의 userID
        const { userCookies, adminCookies } = req.cookies;
        // 관리자인 경우
        if (adminCookies) {
            const err = new Error('접근 권한이 없습니다.');
            err.statusCode = 403;
            return next(err);
        }

        const user = await User.findById(res.locals.user._id).lean();
        // 유저가 존재하지 않을경우
        if (!user) {
            const err = new Error('해당 유저를 찾을 수 없습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }
        // 4가지 user정보 반환(이름, 이메일, 주소, 전화번호)
        res.json({
            err: null,
            data: { name: user.name, email: user.email, address: user.address, phonenumber: user.phoneNumber },
        });
    } catch (e) {
        // 서버 에러가 났을 경우
        next(e);
    }
});

//UPDATE
router.put('/', async (req, res, next) => {
    try {
        // 쿠키의 userID
        const { userCookies, adminCookies } = req.cookies;
        // 관리자인 경우
        if (adminCookies) {
            const err = new Error('접근 권한이 없습니다.');
            err.statusCode = 403;
            return next(err);
        }

        const user = await User.findById(res.locals.user._id).lean();

        // 유저가 존재하지 않을경우
        if (!user) {
            const err = new Error('해당 유저를 찾을 수 없습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }

        const { name, email, password, confirmPassword, postNumber, address, detailAddress, phoneNumber } = req.body;

        // name이 string type이 아니거나 빈 값일 경우 에러 핸들러로 에러 넘김
        if (typeof name !== 'string' || name === '') {
            const err = new Error('이름은 문자열 값이며 빈 값이 아니어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }
        // 비밀번호 길이가 8글자 미만이거나 영문자 또는 숫자 또는 특수문자 포함 안 됐을 경우
        // 에러 핸들러로 에러 넘김
        if (
            password.length < 8 ||
            password.search(/[a-z]/i) === -1 ||
            password.search(/[1-9]/i) === -1 ||
            password.search(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g) === -1
        ) {
            const err = new Error('비밀번호 양식이 맞지 않습니다.');
            err.statusCode = 400;
            return next(err);
        }

        // password와 confirmPassword 불일치 할 경우 에러 핸들러로 에러 넘김
        if (password !== confirmPassword) {
            const err = new Error('비밀번호가 일치하지 않습니다.');
            err.statusCode = 400;
            return next(err);
        }

        // phoneNumber가 string type이 아니거나 빈 값일 경우 에러 핸들러로 에러 넘김
        if (typeof phoneNumber !== 'string' || phoneNumber === '') {
            const err = new Error('전화번호는 문자열 값이며 빈 값이 아니어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // address가 string type이 아니거나 빈 값일 경우 에러 핸들러로 에러 넘김
        if (
            typeof postNumber !== 'string' ||
            postNumber === '' ||
            typeof address !== 'string' ||
            address === '' ||
            typeof detailAddress !== 'string' ||
            detailAddress === ''
        ) {
            const err = new Error('주소는 문자열 값이며 빈 값이 아니어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        const hashPassword = await bcrypt.hash(password, 10);

        // 요청에서 수정 할 데이터 선언
        const data = {
            _id: res.locals.user._id,
            name: name,
            email: email,
            password: hashPassword,
            phoneNumber: phoneNumber,
            address: [postNumber, address, detailAddress],
        };

        // DB에 데이터 저장
        const result = await User.updateOne({ _id: res.locals.user._id }, data);
        // update가 제대로 이루어졌는지 확인하는 코드
        if (result.modifiedCount === 0) {
            const err = new Error('존재하지 않는 회원입니다.');
            err.statusCode = 404;
            next(err);
            return;
        }

        // 수정한 데이터를 바탕으로 토큰 새로 만들어줌
        const newJsonToken = jwt.sign(data, process.env.USER_JWT_SECRET_KEY, { expiresIn: '30m' });

        res.status(201)
            .cookie('userCookies', newJsonToken, { httpOnly: true, secure: true })
            .json({ err: null, data: data });
    } catch (e) {
        next(e);
    }
});

// 회원 탈퇴
router.put('/cancel', async (req, res, next) => {
    try {
        // 쿠키의 userID
        const { userCookies, adminCookies } = req.cookies;
        // 관리자인 경우
        if (adminCookies) {
            const err = new Error('접근 권한이 없습니다.');
            err.statusCode = 403;
            return next(err);
        }

        // decode해서 얻은 payload에서 _id로 해당 유저 찾음
        const user = await User.findById(res.locals.user._id).lean();

        if (!user) {
            const err = new Error('유저를 찾을 수 없습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }

        // user 탈퇴했을 때 상태정보 어떻게 보내줄 건지?

        res.json({ err: null, data: '탈퇴되었습니다.' });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
