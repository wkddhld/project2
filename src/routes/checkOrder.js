const express = require("express");
const router = express.Router();
const { Order, User } = require("../data");
const { isLogined } = require("../middlewares");

//주문조회
router.get('/api/orders', async (req, res, next)=>{
    try{
        // 주문번호 받아오기
        const orderNumer = req.query.orderNumer;

        // 주문번호 검색z
        const order = await Order.findOne({number : Number(orderNumer)});
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
router.put('/api/orders', async (req, res, next)=>{
    try{
        const {receiverAddr, email, receiverName, receiverPhone, products, OrderNumber} = req.body;

        //해당 유저가 생성한 주문인지 확인하는 과정
        const {userCookies} = req.cookies;
        let userInfo;

        if(userCookies){
            userInfo = email;
        }

        const check_user = await User.findOne({email: email});
    
        

        if(!receiverAddr||!receiverEmail||!receiverName||!receiverPhone||!products||!Array.isArray(products)||products.length === 0){
            const err = new Error("잘못된 요청입니다.")
            next(err);
            return;
        }

        const data = {
            receiverAddress: receiverAddr,
            email: email,
            receiverName: receiverName,
            receiverPhone: receiverPhone,
            products: products,
            number: OrderNumber,
            date: new Date(),
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
        const {receiverAddr, email, receiverName, receiverPhone, products} = req.body;
        if(!receiverAddr||!email||!receiverName||!receiverPhone||!products||!Array.isArray(products)||products.length === 0){
            const err = new Error("잘못된 요청입니다.")
            next(err);
            return;
        }

        // data를 db에 저장
        const data = {
            receiverAddr: receiverAddr,
            email: email,
            receiverName: receiverName,
            receiverPhone: receiverPhone,
            products: products,
            createAt: new Date(),
            //ordernumber도 들어갈예정
        };

        const NewOrder = new Order(data);
        const result = await NewOrder.save();
        
        // 비회원이면 쿠키보내주기
        if(!req.cookies){
           res.cookie('GusetCookies', {email, orderNumber, password},{});
        }
    }
    catch(e){
        next(e);
    }
});

//주문삭제
router.delete('/api/orders', async (req, res, next) => {
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

