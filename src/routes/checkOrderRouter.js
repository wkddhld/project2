const express = require('express');
const router = express.Router();
const { Order, Guest } = require('../data');
const { customAlphabet } = require('nanoid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// 주문번호 만들기
const numbers = '0123456789';
const nanoid = customAlphabet(numbers, 10); // 0-9 랜덤으로 10자리 숫자 만들어주는 코드
function generateNumericOrderNumber() {
    return nanoid();
}

// 토큰확인 함수
const verifyToken = (token, secretKey) => {
    try {
        return jwt.verify(token, secretKey);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            const error = new Error('토큰이 만료되었습니다. 다시 로그인 해주세요.');
            error.statusCode = 401;
            throw error;
        }
        if (err.name === 'JsonWebTokenError') {
            const error = new Error('유효하지 않거나 손상된 토큰입니다. 다시 로그인 해주세요.');
            error.statusCode = 401;
            throw error;
        }
        throw err; // 다른 예기치 않은 에러
    }
};

//주문조회
router.get('/', async (req, res, next) => {
    try {
        // 쿠키 확인
        const { userCookies, guestCookies } = req.cookies;

        if (!userCookies && !guestCookies) {
            const error = new Error('쿠키가 없습니다.');
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
        const order = await Order.find({ email: decoded.email });

        // 주문번호가 없을시
        if (order.length === 0) {
            const error = new Error('주문을 찾을 수 없습니다.');
            error.statusCode = 404;
            return next(error);
        }

        // 주문정보 전송
        res.json({ err: null, data: order });
    } catch (e) {
        next(e);
    }
});

//주문생성
router.post('/', async (req, res, next) => {
    try {
        const { products, name, phoneNumber, email, postAddress, address, detailAddress, password, confirmPassword } =
            req.body;

        // products가 안 들어왔거나, 배열 형태가 아니거나 상품이 하나도 없을 경우
        if (!products || !Array.isArray(products) || products.length === 0) {
            const err = new Error('존재하지 않는 상품입니다.');
            err.statusCode = 400;
            return next(err);
        }
        // 이름이  string type이 아니거나 빈 값일 경우
        if (typeof name !== 'string' || name === '') {
            const err = new Error('이메일은 문자열 값이며 빈 값이 아니어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }
        // 이메일이  string type이 아니거나 빈 값일 경우
        if (typeof email !== 'string' || email === '') {
            const err = new Error('이메일은 문자열 값이며 빈 값이 아니어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }
        
        // 전화번호가  string type이 아니거나 빈 값이거나 길이가 11자리가 아닌 경우
        if (typeof phoneNumber !== 'string' || phoneNumber === '' || phoneNumber.length !== 11) {
            const err = new Error('이메일은 문자열 값이며 빈 값이 아니어야 하고 11자리이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }
        // 우편번호 string type이 아니거나 빈 값인 경우
        if (typeof postAddress !== 'string' || postAddress === '') {
            const err = new Error('우편번호는 문자열 값이며 빈 값이 아니어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }
        // 도로명 주소가 string type이 아니거나 빈 값인 경우
        if (typeof address !== 'string' || address === '') {
            const err = new Error('도로명 주소는 문자열 값이며 빈 값이 아니어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }
        // 상세 주소가  string type이 아니거나 빈 값인 경우
        if (typeof detailAddress !== 'string' || detailAddress === '') {
            const err = new Error('상세 주소는 문자열 값이며 빈 값이 아니어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 쿠키가 없으면 비회원
        if (!req.cookies) {
            // 비밀번호가 숫자값이 아니거나 4자리가 아닌 경우
            if (!Number.isInteger(Number(password)) || password.length === 4) {
                const err = new Error('비밀번호는 네 자리 숫자값이어야 합니다.');
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
            // guest DB에 데이터 저장
            await Guest.create({
                email,
                name,
                password: hashPassword,
                phoneNumber,
            });
            // 비회원 주문 정보
            const guestOrderData = {
                number: Number(generateNumericOrderNumber()),
                name: name,
                date: new Date(),
                address:[postAddress, address, detailAddress],
                email: email,
                phoneNumber: phoneNumber,
                products: products,
                orderState: true
            };
            // 비회원 주문 정보를 주문 DB에 저장
            const newGuestOrder = new Order(guestOrderData);
            const result = await newGuestOrder.save();
            // 생성한 주문번호 이메일로 전송하는 로직 추가해야 함
            // 세션 쿠키 사용하는데, 비회원인 사람이 주문하고 브라우저 닫으면 토큰은 사라지는데
            // 이 경우에는 어떡하죠..?
            // 비회원 위한 쿠키 및 토큰 생성
            const token = jwt.sign(result, process.env.GUSET_SECRET_KEY, { expiresIn: '30m' });
            res.cookie('gusetCookies', token, { httpOnly: true, secure: true });
            res.status(204).json({ err: null, data: '주문 완료되었습니다.' });
            return;
        }

        // data를 db에 저장
        const userData = {
            number: Number(generateNumericOrderNumber()),
            name,
            address:[postAddress, address, detailAddress],
            email,
            phoneNumber,
            products,
            orderState: "주문완료"
        };
    
        const userOrder = new Order(userData);
        console.log(userOrder);
        await userOrder.save();
        
        res.status(204).json({err: null});
    } catch (e) {
        next(e);
    }
});

//주문 취소
router.put('/cancel/:orderNumber', async (req, res, next) => {
    try {
        // 주문 정보 받아오기
        const { orderNumber } = req.params;

        // 주문번호가 number type이 아닌 경우
        if (!Number.isInteger(Number(orderNumber))) {
            const err = new Error('해당하는 주문 내역을 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }

        // orderNumber가 본인의 주문인지 아닌지 확인하는 절차
        const OrderCheck= await Order.find({email: res.locals.user.email});
        let result;
        
        for (const check of OrderCheck) {
            if (check.number === orderNumber) {
                try {
                    result = await Order.updateOne({ number: Number(orderNumber) }, { orderState: false });
                    break;  // 주문을 찾았으므로 반복 중단
                } catch (error) {
                    const err = new Error('주문 업데이트 중 오류가 발생했습니다.');
                    err.statusCode = 500;
                    return next(err);
                }
            } else {
                const err = new Error('사용자의 주문이 아닙니다.');
                err.statusCode = 404;
                return next(err);
            }
        }

        // update가 제대로 됐는지 확인하는 코드
        if (result.modifiedCount === 0) {
            const err = new Error('주문을 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }
        res.json({ err: null, data: '주문이 취소되었습니다.' });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
