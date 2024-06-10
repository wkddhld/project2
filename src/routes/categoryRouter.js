const express = require('express');
const router = express.Router();
const Category = require('../data/models/Category');

// 대분류 카테고리 조회
router.get('/:categoryNumber', async (req, res, next) => {
    const { categoryNumber } = req.params;
    if (!Number.isInteger(categoryNumber)) {
        const err = new Error('categoryNumber field는 number type입니다.');
        err.statusCode = 400;
        next(err);
        return;
    }
    try {
        const category = await Category.find({ categoryNumber: Number(categoryNumber) }).lean();

        if (!category) {
            const err = new Error('해당 카테고리를 찾을 수 없습니다.');
            err.statusCode = 404;
            next(err);
            return; // 매우 중요.  return 해주지 않을 경우 response가 간 다음에도 이후 코드들이 실행됨
        }
        return res.json({
            categoryName: category.categoryName,
            categoryNumber: category.categoryNumber,
        });
    } catch (e) {
        next(e);
    }
});






module.exports = router;
