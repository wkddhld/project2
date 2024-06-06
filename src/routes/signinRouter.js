const express = require(express);
const bcyrpt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User')
const router  = express.Router();


const JWT_SECERT ='rla99dl00chl01rla98wkd27wh5335hw72dkw89alr10lhc00ld99alr';

router.post('/api/v1/signin', async (req, res) => {
    
    const { email, password } = req.body; //
    try {
        // 이메일로 사용자 찾기 useremail
        const user = await User.findOne({ userEmail: email });
        if (!user) {
            return res.status(400).json({ error: "로그인 정보가 일치하지 않습니다.", data: null });
        }

        // 비밀번호 비교 
        const isMatch = await bcrypt.compare(password, user.userPw);
        if (!isMatch) {
            return res.status(400).json({ error: "로그인 정보가 일치하지 않습니다.", data: null });
        }

        const token = jwt.sign({ userEmail: user.userEmail }, JWT_SECERT, {expiresIn:'30m' })

        // 로그인 성공
        return res.status(200).json({ error: null, data: "로그인에 성공하셨습니다." });
    } catch (error) {
        return res.status(500).json({ error: "서버오류입니다.", data: null });
    }
});

module.exports = router;