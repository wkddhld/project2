const router = require('express').Router();
const { User } = require('../data');
const bcrypt = require('bcrypt');

router.get('/', async (req, res) => {
    res.json('회원가입 path');
});

router.post('/', async (req, res, next) => {
    try {
        const { userName, userEmail, userPw, userPhone, userAddr, agreement } = req.body;
        const hashPw = await bcrypt.hash(userPw, 10);
        const data = await User.create({ userName, userEmail, userPw: hashPw, userPhone: Number(userPhone), userAddr });
        res.status(200).json(data);
    } catch (e) {
        next(e);
    }
});

router.post('/check-email', async (req, res, next) => {
    try {
        const { email } = req.body;
        const dbEmail = await User.findOne({ userEmail: email });
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
