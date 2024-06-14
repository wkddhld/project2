const express = require('express');
const router = express.Router();
const { subCategory } = require('../data');
const { isAuthenticatedAdminMiddleware } = require('../middlewares');
// 소분류 카테고리 추가
router.post('/', isAuthenticatedAdminMiddleware, async (req, res, next) => {
    const { subCategoryNumber, subCategoryName } = req.body; // 요청 본문에서 subCategoryNumber, subCategoryName 추출

    const subCategoryNum = Number(subCategoryNumber);

    if (existingSubCategory) {
        const err = new Error('이미 존재하는 소분류 카테고리입니다.');
        err.statusCode = 400;
        next(err);
        return;
    }

    try {
        // 동일한 subCategoryNumber를 가진 소분류 카테고리가 이미 존재하는지 확인
        const existingSubCategory = await subCategory.findOne({ number: subCategoryNum }).lean();
        if (existingSubCategory) {
            const err = new Error('이미 존재하는 소분류 카테고리입니다.');
            err.statusCode = 400;
            next(err);
            return;
        }

        // 새로운 소분류 카테고리 생성
        const newSubCategory = await subCategory.create({
            number: subCategoryNum,
            name: subCategoryName,
        });

        // 성공적으로 생성된 경우 응답 반환
        return res.status(201).json({
            err: null,
            data: { subCategoryName: newSubCategory.name, subCategoryNumber: newSubCategory.number },
        });
    } catch (e) {
        next(e);
    }
});

// 소분류 카테고리 수정
router.put('/:subCategoryNumber', isAuthenticatedAdminMiddleware, async (req, res, next) => {
    const { subCategoryNumber } = req.params; // URL 파라미터에서 subCategoryNumber 추출
    const { newSubCategoryNumber, subCategoryName } = req.body; // 요청 본문에서 새로운 subCategoryNumber, subCategoryName 추출

    if (!Number.isInteger(newSubCategoryNumber)) {
        const err = new Error('subCategoryNumber 필드는 number 타입이어야 합니다.');
        err.statusCode = 400;
        next(err);
        return;
    }

    try {
        // subCategoryNumber에 해당하는 소분류 카테고리를 찾고 업데이트
        const subCategory = await subCategory.findOneAndUpdate(
            { number: subCategoryNumber },
            {
                number: newSubCategoryNumber,
                name: subCategoryName,
            },
            { new: true } // 업데이트된 문서를 반환하도록 설정
        );

        // 소분류 카테고리를 찾지 못한 경우
        if (!subCategory) {
            const err = new Error('해당 소분류 카테고리가 존재하지 않습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }

        return res.json({
            err: null,
            data: { subCategoryName: subCategory.name, subCategoryNumber: subCategory.number },
        });
    } catch (e) {
        next(e);
    }
});

// 소분류 카테고리 삭제
router.delete('/:subCategoryNumber', isAuthenticatedAdminMiddleware, async (req, res, next) => {
    const { subCategoryNumber } = req.params; // URL 파라미터에서 subCategoryNumber 추출

    const subCategoryNumberInt = parseInt(subCategoryNumber, 10);
    if (isNaN(subCategoryNumberInt)) {
        const err = new Error('subCategoryNumber 필드는 number 타입이어야 합니다.');
        err.statusCode = 400;
        next(err);
        return;
    }

    try {
        // subCategoryNumber에 해당하는 소분류 카테고리를 찾고 삭제
        const subCategory = await subCategory.findOneAndDelete({ number: subCategoryNumberInt });

        // 소분류 카테고리를 찾지 못한 경우
        if (!subCategory) {
            const err = new Error('해당 소분류 카테고리가 존재하지 않습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }

        return res.status(204).json({ err: null, data: '정상적으로 소분류 카테고리가 삭제되었습니다.' });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
