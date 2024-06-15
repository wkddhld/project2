const express = require('express');
const router = express.Router();
const { Category } = require('../data');

// 대분류 카테고리 추가
router.post('/', async (req, res, next) => {
    const { categoryNumber, categoryName } = req.body; // 요청 본문에서 categoryNum과 categoryName 추출

    if (!Number.isInteger(categoryNumber) || categoryNumber.toString().length > 2) {
        const err = new Error('대분류 카테고리는 2자리 이하의 숫자값이어야 합니다.');
        err.statusCode = 400;
        next(err);
        return;
    }

    try {
        // 동일한 categoryNum을 가진 카테고리가 이미 존재하는지 확인
        const existingCategory = await Category.findOne({ number: categoryNumber }).lean();
        if (existingCategory !== null) {
            const err = new Error('이미 존재하는 대분류 카테고리입니다.');
            err.statusCode = 400;
            next(err);
            return; // 매우 중요.
        }

        // 새로운 카테고리 생성
        const newCategory = await Category.create({ number: categoryNumber, name: categoryName });
        // 성공적으로 생성된 경우 응답 반환

        return res.status(201).json({
            err: null,
            data: { categoryName: newCategory.name, categoryNumber: newCategory.number },
        });
    } catch (e) {
        next(e);
    }
});

// 대분류 카테고리 수정
router.put('/:categoryNumber', async (req, res, next) => {
    const { categoryNumber } = req.params; // URL 파라미터에서 categoryNum 추출
    const { newCategoryNumber, categoryName } = req.body; // 요청 본문에서 새로운 categoryNum과 categoryName 추출

    const foundCategory = await Category.findOne({ number: Number(categoryNumber) }).lean();
    // categoryNumber가 2자리 초과이거나 숫자값이 아니거나 카테고리 db에 존재하지 않는 경우
    if (
        !Number.isInteger(Number(categoryNumber)) ||
        categoryNumber.length > 2 ||
        foundCategory === null ||
        foundCategory === undefined
    ) {
        const err = new Error('존재하지 않는 대분류 카테고리입니다.');
        err.statusCode = 404;
        next(err);
        return;
    }
    // 수정하려는 대분류 카테고리 번호가 2자리 초과이거나 숫자값이 아닌 경우
    if (!Number.isInteger(newCategoryNumber) || newCategoryNumber.toString().length > 2) {
        const err = new Error('대분류 카테고리는 2자리 이하의 숫자값이어야 합니다.');
        err.statusCode = 400;
        next(err);
        return;
    }

    // 수정하려는 카테고리 번호가 db에 있는지 체크하는 코드가 필요할 것 같습니다
    const existingCategory = await Category.findOne({ number: newCategoryNumber });
    if (existingCategory !== null) {
        const err = new Error('존재하는 대분류 카테고리 번호입니다.');
        err.statusCode = 400;
        return next(err);
    }

    try {
        // categoryNumber에 해당하는 카테고리를  업데이트
        const category = await Category.updateOne(
            { number: Number(categoryNumber) },
            { number: newCategoryNumber, name: categoryName },
            { new: true } // 업데이트된 문서를 반환하도록 설정
        );

        return res.json({
            err: null,
            data: { categoryName: category.name, categoryNumber: category.number },
        });
    } catch (e) {
        next(e);
    }
});

// 대분류 카테고리 삭제
router.delete('/:categoryNumber', async (req, res, next) => {
    const { categoryNumber } = req.params; // URL 파라미터에서 categoryNumber 추출

    const foundCategory = await Category.findOne({ number: Number(categoryNumber) }).lean();
    // categoryNumber가 2자리 초과이거나 숫자값이 아니거나 카테고리 db에 존재하지 않는 경우
    if (
        !Number.isInteger(Number(categoryNumber)) ||
        categoryNumber.length > 2 ||
        foundCategory === null ||
        foundCategory === undefined
    ) {
        const err = new Error('존재하지 않는 대분류 카테고리입니다.');
        err.statusCode = 404;
        next(err);
        return;
    }
    try {
        // categoryNumber에 해당하는 카테고리를 삭제
        await Category.deleteOne({ number: Number(categoryNumber) });

        return res.status(204).json();
    } catch (e) {
        next(e);
    }
});
module.exports = router;
