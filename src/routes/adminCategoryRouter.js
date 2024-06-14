const express = require('express');
const router = express.Router();
const Category = require('../data/models/Category');

// 대분류 카테고리 추가
router.post('/', async (req, res, next) => {
    const { categoryNumber, categoryName } = req.body; // 요청 본문에서 categoryNum과 categoryName 추출
    if (!Number.isInteger(categoryNumber) || categoryNumber.length > 2) {
        const err = new Error('categoryNumber field는 숫자값이이어야하고 2자리 이하여야 합니다.');
        err.statusCode = 400;
        next(err);
        return;
    }
    try {
        // 동일한 categoryNum을 가진 카테고리가 이미 존재하는지 확인
        const existingCategory = await Category.findOne({ categoryNumber: categoryNumber }).lean();
        if (existingCategory) {
            const err = new Error('이미 존재하는 카테고리입니다.');
            err.statusCode = 400;
            next(err);
            return; // 매우 중요.
        }
        // 새로운 카테고리 생성
        const newCategory = await Category.create({ categoryNumber:categoryNumber, categoryName });
        // 성공적으로 생성된 경우 응답 반환
        return res.status(201).json({
            err: null,
            data: { categoryName: newCategory.categoryName, categoryNumber: newCategory.categoryNumber },
        });
    } catch (e) {
        next(e);
    }
});

// 대분류 카테고리 수정
router.put('/:categoryNumber', async (req, res, next) => {
    const { categoryNumber } = req.params; // URL 파라미터에서 categoryNum 추출
    const { newCategoryNumber, categoryName } = req.body; // 요청 본문에서 새로운 categoryNum과 categoryName 추출

    if (!Number.isInteger(newCategoryNumber) || !!Number.isInteger(Number(categoryNumber))) {
        const err = new Error('categoryNumber field는 number type이어야 합니다.');
        err.statusCode = 400;
        next(err);
        return;
    }
    try {
        // categoryNumber에 해당하는 카테고리를 찾고 업데이트
        const category = await Category.findOneAndUpdate(
            { categoryNumber: Number(categoryNumber) },
            { categoryNumber: newCategoryNumber, categoryName },
            { new: true } // 업데이트된 문서를 반환하도록 설정
        );
        // 카테고리를 찾지 못한 경우
        if (!category) {
            const err = new Error('해당 카테고리가 존재하지 않습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }

        return res.json({
            err: null,
            data: { categoryName: category.categoryName, categoryNumber: category.categoryNumber },
        });
    } catch (e) {
        next(e);
    }
});

// 대분류 카테고리 삭제
router.delete('/:categoryNumber', async (req, res, next) => {
    const { categoryNumber } = req.params; // URL 파라미터에서 categoryNumber 추출

    if (!Number.isInteger(Number(categoryNumber))) {
        const err = new Error('categoryNumber field는 number type어야 합니다.');

        err.statusCode = 400;
        next(err);
        return;
    }
    try {
        // categoryNumber에 해당하는 카테고리를 찾고 삭제
        const category = await Category.findOneAndDelete({ categoryNumber:Number(categoryNumber) });
        // 카테고리를 찾지 못한 경우
        if (!category) {
            const err = new Error('해당 카테고리가 존재하지 않습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }

        return res.status(204).json({ err: null, data: '정상적으로 카테고리가 삭제되었습니다.' });
    } catch (e) {
        next(e);
    }
});
module.exports = router;
