const router = require('express').Router();
const { User } = require('../data');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 회원가입 api 로직
router.post('/sign-up', async (req, res, next) => {
    try {
        // 필수 필드들에 대해서 검증하는 코드 필요해보임
        // ex. 빈 값, 이메일 format, 안전하지 않은 패스워드 등
        const { name, email, password, phoneNumber, postNumber, address, detailAddress } = req.body;
        const hashPassword = await bcrypt.hash(password, 10); // 전달 받은 비밀번호 해시화
        // 유저 데이터 db에 저장하기
        const data = await User.create({
            name,
            email,
            password: hashPassword,
            phoneNumber,
            address: [postNumber, address, detailAddress],
        });
        res.json({
            name: data.name,
            email: data.email,
            password: data.password,
            phoneNumber: data.phoneNumber,
            address: data.address,
        });
    } catch (e) {
        next(e);
    }
});

// 이메일 중복 체크하는 로직
router.post('/sign-up/check-email', async (req, res, next) => {
    try {
        // 이메일 검증하는 코드 필요해보임
        const { email } = req.body;
        // user 데이터에서 req.body로 받은 이메일과 일치하는 사용자가 있는지 확인
        const foundEmail = await User.findOne({ email }).lean();

        // 일치한다면
        if (email === foundEmail.email) {
            const err = new Error('이미 존재하는 email입니다.');
            err.statusCode = 400;
            next(err);
            return; // 매우 중요.  return 해주지 않을 경우 response가 간 다음에도 이후 코드들이 실행됨
        }

        res.json(email);
    } catch (e) {
        next(e);
    }
});

// 로그인 api
router.post('/sign-in', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 이메일이 string 값이 아니거나 빈 값일 때
        if (typeof email !== 'string' || email === '') {
            const err = new Error('이메일은 string type이며 빈 값이 될 수 없습니다.');
            err.statusCode = 400;
            next(err);
            return;
        }
        // 비밀번호가 string 값이 아니거나 빈 값일 때
        if (typeof password !== 'string' || password === '') {
            const err = new Error('비밀번호는 string type이며 빈 값이 될 수 없습니다.');
            err.statusCode = 400;
            next(err);
            return;
        }

        // FE에서 받아온 email과 일치하는 데이터 하나만 찾음
        const foundData = await User.findOne({ email }).lean();
        const isPassword = await bcrypt.compare(password, foundData.password);
        if (!foundData || !isPassword) {
            const err = new Error('이메일이나 비밀번호가 일치하지 않습니다.');
            err.statusCode = 400;
            next(err);
            return;
        }
        // 토큰 생성
        const jwtToken = jwt.sign(foundData, process.env.JWT_SECRET_KEY, { expiresIn: '30m' });
        if (!foundData.isAdmin) {
            res.cookie('userCookies', jwtToken, { httpOnly: true, secure: true, domain: 'localhost' }).json(
                '로그인에 성공하셨습니다. 환영합니다.'
            );
        } else {
            res.cookie('adminCookies', jwtToken, {
                httpOnly: true,
                secure: true,
                domain: 'localhost',
                path: '/admin',
            }).json('로그인에 성공하셨습니다. 환영합니다.');
        }
        // 쿠키에 토큰 담아서 보냄
    } catch (e) {
        next(e);
    }
});

module.exports = router;
