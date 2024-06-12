const express = require('express');
const router = express.Router();
const { subCategory, Category, Product } = require('../data');

// 대분류 카테고리별 상품 조회
router.get('/:categoryNumber', async (req, res, next) => {
    const { categoryNumber } = req.params;
    if (!Number.isInteger(categoryNumber)) {
        const err = new Error('categoryNumber field는 number type입니다.');
        err.statusCode = 400;
        next(err);
        return;
    }

    try {
        const categoryProduct = await Product.find({ categoryNumber: Number(categoryNumber) }).lean();

        if (!categoryProduct) {
            const err = new Error('해당 카테고리의 상품을 찾을 수 없습니다.');
            err.statusCode = 404;
            next(err);
            return; // 매우 중요.  return 해주지 않을 경우 response가 간 다음에도 이후 코드들이 실행됨
        }

        return res.json({
            image: categoryProduct.image,
            name: categoryProduct.name,
            price: categoryProduct.price,
        });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
