const express = require('express');
const router = express.Router();
const { User } = require('../data');

//READ
router.get('/', async (req, res, next) => {
    try {
        // 쿠키의 userID
        const { userCookies, adminCookies } = req.cookies;
        let userId;

        if (userCookies) {
            userId = userCookies;
        } else if (adminCookies) {
            userId = adminCookies;
        }

        // userID가 없을경우 403에러 반환
        if (!userId) {
            const err = new Error('인증되지 않은 사용자입니다.');
            err.statusCode = 403;
            next(err);
            return; // 매우 중요.  return 해주지 않을 경우 response가 간 다음에도 이후 코드들이 실행됨
        }

        const user = await User.findById(userId).lean();

        // 4가지 user정보 반환
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
        let userId;

        if (userCookies) {
            userId = userCookies;
        } else if (adminCookies) {
            userId = adminCookies;
        }

        if (!userId) {
            const err = new Error('인증되지 않은 사용자입니다.');
            err.statusCode = 403;
            next(err);
            return;
        }

        // 유저가 존재하지 않을경우
        const user = await User.findById(userId).lean();
        if (!user) {
            const err = new Error('유저를 찾을 수 없습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }

        // 요청에서 수정 할 데이터 선언
        const data = {
            userName: req.body.userName,
            userEmail: req.body.userEmail,
            userAddr: req.body.userAddr,
            userPhone: req.body.userPhone,
        };

        // DB에 데이터 저장
        const result = await User.updateOne({ _id: userId }, data);
        // update가 제대로 이루어졌는지 확인하는 코드
        if (result.modifiedCount === 0) {
            const err = new Error('존재하지 않는 회원입니다.');
            err.statusCode = 404;
            next(err);
            return;
        }

        res.status(201).send({ err: null, data: data });
    } catch (e) {
        next(e);
    }
});

//DELETE
router.delete('/', async (req, res, next) => {
    try {
        // 쿠키의 userID
        const { userCookies, adminCookies } = req.cookies;
        let userId;

        if (userCookies) {
            userId = userCookies;
        } else if (adminCookies) {
            userId = adminCookies;
        }

        if (!userId) {
            const err = new Error('인증되지 않은 사용자입니다.');
            err.statusCode = 403;
            next(err);
            return;
        }

        // 유저가 존재하지 않을경우
        const user = await User.findById(userId).lean();
        if (!user) {
            const err = new Error('유저를 찾을 수 없습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }

        // 삭제를 완료했을 경우
        const result = await User.deleteOne({ _id: userId });
        if (result.deletedCount === 0) {
            const err = new Error('존재하지 않는 회원입니다.');
            err.statusCode = 404;
            next(err);
            return;
        }
        res.json({ err: null, data: '성공적으로 삭제했습니다.' });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
