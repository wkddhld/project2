const express = require("express");
const router = express.Router();
const {Order} = require("../data");
const {isLogined} = require("../middlewares");

//주문조회
router.get('/api/orders', async (req, res, next)=>{
    try{
        // 주문번호 받아오기
        const orderNum = req.query.orderNum;

        // 주문번호 검색
        const order = await Order.findOne({number : parseInt(orderNum)});
        // 주문번호가 없을시
        if(!order){
            const err = 404;
            next(err);
            return;
        }
        // 주문정보 전송
        res.json(order);
    }
    catch(e){
        next(e);
    }
});

//주문수정
router.put('/api/orders', isLogined, async (req, res, next)=>{
    try{
        const {receiveAddr, receiveEmail, receiveName, receivePhone, products, OrderNumber} = req.body;
        if(!receiveAddr||!receiveEmail||!receiveName||!receivePhone||!products||!Array.isArray(products)||products.length === 0){
            const err = new Error("잘못된 요청입니다.")
            next(err);
            return;
        }

        const data = {
            receiveAddr: receiveAddr,
            receiveEmail: receiveEmail,
            receiveName: receiveName,
            receivePhone: receivePhone,
            products: products,
            OrderNumber: OrderNumber,
            createAt: new Date(),
        };

        const result = await Order.updateOne({ _id: OrderNumber }, data);
        // update가 제대로 이루어졌는지 확인하는 코드
        if (result.modifiedCount === 0) {
            const err = new Error('주문을 찾을 수 없습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }
        res.json({message:"주문이 정상적으로 수정됐습니다."});
    }
    catch(e){
        next(e);
    }
});

//주문생성
router.post('/api/orders', async (req, res, next)=>{
    try{
        // 데이터가 잘들어왔는지 확인
        const {receiveAddr, receiveEmail, receiveName, receivePhone, products} = req.body;
        if(!receiveAddr||!receiveEmail||!receiveName||!receivePhone||!products||!Array.isArray(products)){
            const err = new Error("잘못된 요청입니다.")
            next(err);
            return;
        }

        // data를 db에 저장
        const data = {
            receiveAddr: receiveAddr,
            receiveEmail: receiveEmail,
            receiveName: receiveName,
            receivePhone: receivePhone,
            products: products,
            createAt: new Date(),
            //ordernumber도 들어갈예정
        };

        // DB에 데이터 저장
        const NewOrder = new Order(data);
        const result = await NewOrder.save();
        
        res.status(201).send({message: '주문이 완료됐습니다.'});
    }
    catch(e){
        next(e);
    }
});

//주문삭제
router.delete('/api/orders', isLogined, async (req, res, next) => {
    try {

        // 주문 정보 받아오기
        const { OrderNumber } = req.body;
        
        // 잘못된 요청
        if (!OrderNumber) {
            const err = new Error("잘못된 요청입니다.");
            err.statusCode = 400
            next(err);
            return;
        }

        const result = await Order.deleteOne({ _id: OrderNumber });
        // 주문정보가 없을시
        if (result.deletedCount === 0) {
            const err = new Error('주문을 찾을 수 없습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }

        res.json({ message: '주문이 성공적으로 삭제되었습니다.' });
    } catch (e) {
        next(e);
    }
});

