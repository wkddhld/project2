const router = require('express').Router();
const { User } = require('../data');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    res.json('로그인 path');
});

router.post('/', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const data = await User.findOne({ userEmail: email });
        console.log(data);
        const isPw = await bcrypt.compare(password, data.userPw);
        if (email !== data.userEmail || !isPw) {
            const err = new Error('이메일이나 비밀번호가 일치하지 않습니다.');
            err.statusCode = 400;
            throw err;
        }
        res.status(200).json('로그인에 성공하셨습니다. 환영합니다.');
    } catch (e) {
        next(e);
    }
});

module.exports = router;
