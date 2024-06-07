const router = require('express').Router();
const { User } = require('../data');
const bcrypt = require('bcrypt');

router.get('/', async (req, res) => {
    res.json('회원가입 path');
});

// 회원가입 api 로직
router.post('/', async (req, res, next) => {
    try {
        const { userName, userEmail, userPw, userPhone, userAddr, agreement } = req.body;
        const hashPw = await bcrypt.hash(userPw, 10); // 전달 받은 비밀번호 해시화
        // 유저 데이터 db에 저장하기
        const data = await User.create({ userName, userEmail, userPw: hashPw, userPhone: Number(userPhone), userAddr });
        res.status(200).json(data);
    } catch (e) {
        next(e);
    }
});

// 이메일 중복 체크하는 로직
router.post('/check-email', async (req, res, next) => {
    try {
        const { email } = req.body;
        // user 데이터에서 req.body로 받은 이메일과 일치하는 사용자가 있는지 확인
        const dbEmail = await User.findOne({ userEmail: email });
        // 일치한다면
        if (email === dbEmail.userEmail) {
            const err = new Error('이미 존재하는 email입니다.');
            err.statusCode = 400;
            throw err;
        }
        console.log(dbEmail);
        res.status(200).json(email);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
