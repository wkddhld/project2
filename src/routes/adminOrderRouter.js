const express = require('express');
const router = express.Router();
const { Order } = require('../data');

// 관리자 주문 조회
router.get('/', async (req, res, next) => {
    try {
        const orders = await Order.find().lean();
        if (orders.length === 0) {
            const err = new Error('주문을 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }

        res.json({ error: null, data: orders });
    } catch (e) {
        next(e);
    }
});

// 관리자 주문 취소 및 배송 상태 수정
router.put('/:orderNumber', async (req, res, next) => {
    try {
        const { orderNumber } = req.params;
        const { orderState } = req.body;

        // 수정하려는 주문이 존재하지 않는 경우
        const order = await Order.findOne({ number: Number(orderNumber) }).lean();
        if (order === null || order === undefined) {
            const err = new Error('존재하지 않는 주문입니다.');
            err.statusCode = 404;
            return next(err);
        }

        // 주문상태가 "배송완료"인 경우
        if (order.orderState === '배송완료') {
            const err = new Error('배송 완료 상태이므로 수정이 불가합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 주문이 취소된 상태인 경우
        if (order.orderState === '주문취소' || (order.orderState === '주문취소' && orderState === '주문취소')) {
            const err = new Error('이미 취소된 주문입니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 비회원의 주문을 배송완료로 변경 시 user 정보 db에서 삭제
        await Order.updateOne({ number: Number(orderNumber) }, { orderState }, { new: true });

        res.status(201).json({ error: null, data: '주문 상태가 정상적으로 변경되었습니다.' });
    } catch (e) {
        next(e);
    }
});

module.exports = router; // 이 라우터 모듈을 외부로 내보냅니다.
