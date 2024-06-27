const express = require('express');

const router = express.Router();
const { Order } = require('../data');

// 관리자 주문 조회
router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find().lean();
    if (orders.length === 0) {
      res.json({ err: null, data: { message: '주문이 존재하지 않습니다.' } });
    }

    res.json({ err: null, data: orders });
  } catch (e) {
    next(e);
  }
});

// 관리자 주문 취소 및 배송 상태 수정
router.put('/:orderNumber', async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { orderState } = req.body;

    const orderCancel = '주문취소';
    const deliveryCompleted = '배송완료';

    // 수정하려는 주문이 존재하지 않는 경우
    const order = await Order.findOne({ number: Number(orderNumber) }).lean();
    if (order === null || order === undefined) {
      const err = new Error('존재하지 않는 주문입니다.');
      err.statusCode = 404;
      return next(err);
    }

    // 수정하려는 주문 상태가 주문취소나 배송완료가 아닌 경우
    if (!(orderState === orderCancel || orderState === deliveryCompleted)) {
      const err = new Error('올바른 주문 상태가 아닙니다.');
      err.statusCode = 400;
      return next(err);
    }
    s;

    // 주문상태가 "배송완료"인 경우
    if (order.orderState === deliveryCompleted) {
      const err = new Error('배송 완료 상태이므로 수정이 불가합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 주문이 취소된 상태인 경우
    if (
      order.orderState === orderCancel ||
      (order.orderState === orderCancel && orderState === orderCancel)
    ) {
      const err = new Error('이미 취소된 주문입니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 비회원의 주문을 배송완료로 변경 시 user 정보 db에서 삭제
    const updateData = await Order.updateOne(
      { number: Number(orderNumber) },
      { orderState },
      { new: true },
    );

    // 업데이트가 정상적으로 되었는지 확인해주는 코드
    if (updateData.modifiedCount === 0) {
      const err = new Error('주문 정보를 수정하는 과정에서 오류가 발생했습니다.');
      err.statusCode = 400;
      return next(err);
    }

    res.json({
      err: null,
      data: { orderState, message: '주문 상태가 정상적으로 변경되었습니다.' },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router; // 이 라우터 모듈을 외부로 내보냅니다.
