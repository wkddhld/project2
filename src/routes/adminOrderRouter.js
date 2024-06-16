const express = require('express');
const router = express.Router();
const isAuthenticatedAdminMiddleware = require('../middlewares/isAuthenticatedAdminMiddleware');
const { Order } = require('../data');

// 관리자 주문 조회
router.get('/', isAuthenticatedAdminMiddleware, async (req, res, next) => {
    try {
        const orders = await Order.find();
        if (orders.length === 0) {
            const err = new Error('주문을 찾을 수 없습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }
        res.json({ error: null, data: orders });
    } catch (e) {
        next(e);
    }
});

// 관리자 주문 취소
router.put('/:orderNum', isAuthenticatedAdminMiddleware, async (req, res, next) => {
    const { orderNum } = req.params;
    try {
        const order = await Order.findOneAndUpdate({ number: orderNum }, { orderState: '주문 취소' }, { new: true });
        if (!order) {
            const err = new Error('존재하지 않는 주문입니다.');
            err.statusCode = 404;
            next(err);
            return;
        }
        res.json({ error: null, data: '주문이 정상적으로 삭제되었습니다' });
    } catch (e) {
        next(e);
    }
});

module.exports = router; // 이 라우터 모듈을 외부로 내보냅니다.
