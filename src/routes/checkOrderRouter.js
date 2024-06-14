const express = require('express');
const router = express.Router();
const { Order, Guest } = require('../data');
const { customAlphabet } = require('nanoid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const numbers = '0123456789';
const nanoid = customAlphabet(numbers, 10); // 0-9 랜덤으로 10자리 숫자 만들어주는 코드

function generateNumericOrderNumber() {
    return nanoid();
}

//주문조회
router.get('/', async (req, res, next) => {
    try {
        // 주문번호 받아오기
        const orderNumer = req.query.orderNumer;

        // 주문번호 검색z
        const order = await Order.findOne({ number: Number(orderNumer) });
        // 주문번호가 없을시
        if (!order) {
            const err = 404;
            next(err);
            return;
        }
        // 주문정보 전송
        res.json({ err: null, data: order });
    } catch (e) {
        next(e);
    }
});

//주문수정
router.put('/:orderNumber', async (req, res, next) => {
    try {
        const { orderNumber } = req.params;
        // 프론트엔드가 원하는 정보 넣기
        const { products, name, phoneNumber, email, postAddress, address, detailAddress } = req.body;
        //해당 유저가 생성한 주문인지 확인하는 과정
        const { userCookies, guestCookies } = req.cookies;

        // 주문번호가 number type이 아닌 경우
        if (!Number.isInteger(Number(orderNumber))) {
            const err = new Error('해당하는 주문 내역을 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }

        if (!userCookies && !guestCookies) {
            const err = new Error('인증되지 않은 사용자입니다.');
            err.statusCode = 403;
            return next(err);
        }

        let decoded;

        // 회원인 경우
        if (userCookies) {
            // JWT 토큰 유효성 판단하는 로직
            decoded = jwt.verify(token, process.env.USER_JWT_SECRET_KEY, (err, decoded) => {
                // 토큰이 만료되었을 때
                if (err.name === 'TokenExpiredError') {
                    const err = new Error('토큰이 만료되었습니다. 다시 로그인 해주세요.');
                    err.statusCode = 401;
                    return next(err);
                }
                if (err.name === 'JsonWebTokenError') {
                    const err = new Error('유효하지 않거나 손상된 토큰입니다. 다시 로그인 해주세요.');
                    err.statusCode = 401;
                    return next(err);
                }
            });
        } else {
            // 비회원인 경우
            decoded = jwt.verify(token, process.env.GUEST_JWT_SECRET_KEY, (err, decoded) => {
                if (err.name === 'TokenExpiredError') {
                    const err = new Error('토큰이 만료되었습니다. 다시 로그인 해주세요.');
                    err.statusCode = 401;
                    return next(err);
                }
                if (err.name === 'JsonWebTokenError') {
                    const err = new Error('유효하지 않거나 손상된 토큰입니다. 다시 로그인 해주세요.');
                    err.statusCode = 401;
                    return next(err);
                }
            });
        }
        // 이메일이  string type이 아니거나 빈 값일 경우
        if (typeof email !== 'string' || email === '') {
            const err = new Error('이메일은 문자열 값이며 빈 값이 아니어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // email이 '@'를 포함하지 않거나 ".com"으로 끝나지 않는 경우
        if (!email.includes('@') || email.search('.com$') === -1) {
            const err = new Error('이메일 형식과 맞지 않습니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 요청받은 이메일과 토큰에 저장된 email 정보 일치/불일치 여부 판단
        if (email !== decoded.email) {
            const err = new Error('주문정보가 일치하지 않습니다.');
            err.statusCode = 403;
            return next(err);
        }

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

        const data = {
            name,
            date: new Date(),
            address: [postAddress, address, detailAddress],
            email,
            phoneNumber,
            products,
            orderState: true,
        };

        const result = await Order.updateOne({ number: Number(orderNumber) }, data);
        // update가 제대로 이루어졌는지 확인하는 코드
        if (result.modifiedCount === 0) {
            const err = new Error('주문을 찾을 수 없습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }
        res.json({ err: null, data: '주문이 정상적으로 수정됐습니다.' });
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

        // email이 '@'를 포함하지 않거나 ".com"으로 끝나지 않는 경우
        if (!email.contains('@') || email.search('.com$') === -1) {
            const err = new Error('이메일 형식과 맞지 않습니다.');
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
                number: generateNumericOrderNumber(),
                name: name,
                date: new Date(),
                address: [postAddress, address, detailAddress],
                email: email,
                phoneNumber: phoneNumber,
                products: products,
                orderState: true,
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
            name: name,
            email: email,
            phoneNumber: phoneNumber,
            products: products,
            date: new Date(),
            ordernumber: generateNumericOrderNumber(),
            orderState: true,
        };
        const userOrder = new Order(userData);
        await userOrder.save();
        res.status(204).json({ err: null, data: '주문 완료되었습니다.' });
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

        const result = await Order.updateOne({ number: Number(orderNumber) }, { orderSate: false });
        // update가 제대로 됐는지 확인하는 코드
        if (result.modifiedCount === 0) {
            const err = new Error('주문을 찾을 수 없습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }
        res.json({ err: null, data: '주문이 취소되었습니다.' });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
