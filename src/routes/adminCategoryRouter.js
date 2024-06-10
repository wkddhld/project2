const express = require('express');
const router = express.Router();
const Category = require('../data/models/Category');
//const authenticateAdmin = require('../middlewares/authenticateAdmin');

// 대분류 카테고리 추가
router.post('/', async (req, res, next) => {
    const { categoryNumber, categoryName } = req.body; // 요청 본문에서 categoryNum과 categoryName 추출
    if (!Number.isInteger(categoryNumber)) {
        const err = new Error('categoryNumber field는 number type입니다.');
        err.statusCode = 400;
        next(err);
        return;
    }

    try {
        // 동일한 categoryNum을 가진 카테고리가 이미 존재하는지 확인
        const existingCategory = await Category.findOne({ categoryNumber: Number(categoryNumber) }).lean();
        if (existingCategory) {
            const err = new Error('이미 존재하는 카테고리입니다.');
            err.statusCode = 400;
            next(err);
            return; // 매우 중요.  return 해주지 않을 경우 response가 간 다음에도 이후 코드들이 실행됨
        }
        // 새로운 카테고리 생성
        // 여기서 categoryNumber를 Number로 감싼 후 생성해줘야 하지 않나요..?
        const newCategory = await Category.create({ categoryNumber: Number(categoryNumber), categoryName });
        // 성공적으로 생성된 경우 응답 반환
        return res.status(201).json({
            categoryName: newCategory.categoryName,
            categoryNumber: newCategory.categoryNumber,
        });
    } catch (e) {
        next(e);
    }
});

// 대분류 카테고리 수정
router.put('/:categoryNumber', async (req, res, next) => {
    const { categoryNumber } = req.params; // URL 파라미터에서 categoryNum 추출
    // 그냥 newCateogryNumber라고 써주면 안되는 건가요..?
    const { newCategoryNumber, categoryName } = req.body; // 요청 본문에서 새로운 categoryNum과 categoryName 추출

    if (!Number.isInteger(newCategoryNumber) || !!Number.isInteger(categoryNumber)) {
        const err = new Error('categoryNumber field는 number type입니다.');
        err.statusCode = 400;
        next(err);
        return;
    }
    try {
        // categoryNumber에 해당하는 카테고리를 찾고 업데이트
        const category = await Category.findOneAndUpdate(
            { categoryNumber: Number(categoryNumber) },
            { categoryNumber: Number(newCategoryNumber), categoryName },
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
            categoryName: category.categoryName,
            categoryNumber: category.categoryNumber,
        });
    } catch (e) {
        next(e);
    }
});

// 대분류 카테고리 삭제
router.delete('/:categoryNumber', async (req, res, next) => {
    const { categoryNumber } = req.params; // URL 파라미터에서 categoryNumber 추출
    if (!Number.isInteger(categoryNumber)) {
        const err = new Error('categoryNumber field는 number type입니다.');
        err.statusCode = 400;
        next(err);
        return;
    }
    try {
        // categoryNumber에 해당하는 카테고리를 찾고 삭제
        const category = await Category.findOneAndDelete({ categoryNumber: Number(categoryNumber) });
        // 카테고리를 찾지 못한 경우
        if (!category) {
            const err = new Error('해당 카테고리가 존재하지 않습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }

        return res.status(204).json('정상적으로 카테고리가 삭제되었습니다.');
    } catch (e) {
        next(e);
    }
});

module.exports = router;
