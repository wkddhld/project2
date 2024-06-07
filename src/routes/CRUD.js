const express = require("express");
const router = express.Router();
const { User } = require('../data');
const cookieParser = require("cookie-parser");

// 쿠키사용
router.use(cookieParser);

//READ
router.get('/my-page', async (req, res)=>{
    try{
        // 쿠키의 userID
        const userId =  req.cookies.userId;

        // userID가 없을경우 403에러 반환
        if(!userId){
            return res.status(403).send("인증되지 않은 사용자입니다.");
        }
        
        const user = await User.findById(userId); 
        
        // 4가지 user정보 반환
        res.status(200).json({
        name: user.userName, 
        email: user.userEmail, 
        address: user.userAddr, 
        phonenumber: user.userPhone});
    }
    // 에러가 났을 경우
    catch(e){
        res.status(500).send("서버오류입니다.")
    }
});

//UPDATE
router.put('/my-page', async (req, res)=>{
    try{
        // 쿠키의 userID
        const userId =  req.cookies.userId;

        if(!userId){
            return res.status(403).send("인증되지 않은 사용자입니다.");
        }
        
        // 유저가 존재하지 않을경우
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("유저를 찾을 수 없습니다.");
        }

        // 요청에서 수정 할 데이터 선언
        const data = 
            {userName: req.body.userName,
            userEmail: req.body.userEmail,
            userAddr: req.body.userAddr,
            userPhone: req.body.userPhone
            };

        // DB에 데이터 저장
        await User.updateOne({_id: userId}, data);
        res.status(201).send(data);
    }
    catch(e){
        console.error(e);
        res.status(500).send("서버오류입니다.")
    } 
});

//DELETE
router.delete('/my-page', async (req, res)=>{
    try{
        const userId = req.cookies.userId;
        if(!userId){
            return res.status(403).send("인증되지 않은 사용자입니다.");
        }
        
        // 유저가 존재하지 않을경우
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("유저를 찾을 수 없습니다.");
        }

        // 삭제를 완료했을 경우
        await User.deleteOne({_id: userId});
        res.status(200).send("성공적으로 삭제했습니다.");

    }
    catch(e){
        console.error(e);
        res.status(500).send("서버오류입니다.");
    }
});

module.exprots = router;