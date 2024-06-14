const express = require('express');
const router = express.Router();
const { subCategory, Category } = require('../data');

// 소분류 카테고리 추가
// 소분류 카테고리 추가
router.post('/', async (req, res, next) => {
    const { subCategoryNumber, subCategoryName, mainCategoryNumber } = req.body;

    const subCategoryNum = Number(subCategoryNumber);
    const mainCategoryNum = Number(mainCategoryNumber);

    // subCategoryNumber와 mainCategoryNumber가 숫자인지 확인
    if (!Number.isInteger(subCategoryNum) || subCategoryNumber.toString().length !== 3) {
        const err = new Error('subCategoryNumber field는 3자리 숫자여야 합니다.');
        err.statusCode = 400;
        next(err);
        return;
    }

    if (!Number.isInteger(mainCategoryNum)) {
        const err = new Error('mainCategoryNumber field는 숫자여야 합니다.');
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
            mainCategoryNumber: mainCategoryNum
        });

        // 성공적으로 생성된 경우 응답 반환
        return res.status(201).json({
            err: null,
            data: { 
                subCategoryName: newSubCategory.name, 
                subCategoryNumber: newSubCategory.number,
                mainCategoryNumber: newSubCategory.mainCategoryNumber 
            },
        });
    } catch (e) {
        next(e);
    }
});



// 소분류 카테고리 수정
router.put('/:subCategoryNumber', async (req, res, next) => {
    const { subCategoryNumber } = req.params; // URL 파라미터에서 subCategoryNumber 추출
    const { newSubCategoryNumber, newMainCategoryNumber, subCategoryName } = req.body; // 요청 본문에서 새로운 subCategoryNumber, subCategoryName 추출

    const newSubCategoryNum = Number(newSubCategoryNumber);
    const newMainCategoryNum = Number(newMainCategoryNumber);

    if (!Number.isInteger(newSubCategoryNum) || !Number.isInteger(newMainCategoryNum)) {
        const err = new Error('subCategoryNumber 및 mainCategoryNumber 필드는 number 타입이어야 합니다.');
        err.statusCode = 400;
        next(err);
        return;
    }

    try {
        
        const updatedSubCategory = await subCategory.findOneAndUpdate(
            { number: Number(subCategoryNumber) },
            {
                number: newSubCategoryNum,
                name: subCategoryName,
                mainCategoryNumber: newMainCategoryNum,
            },
            { new: true } // 업데이트된 문서를 반환하도록 설정
        );

        // 소분류 카테고리를 찾지 못한 경우
        if (!updatedSubCategory) {
            const err = new Error('해당 소분류 카테고리가 존재하지 않습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }

        return res.json({
            err: null,
            data: { 
                subCategoryName: updatedSubCategory.name, 
                subCategoryNumber: updatedSubCategory.number,
                mainCategoryNumber: updatedSubCategory.mainCategoryNumber 
            },
        });
    } catch (e) {
        next(e);
    }
});

// 소분류 카테고리 삭제
router.delete('/:subCategoryNumber', async (req, res, next) => {
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
        const deletedSubCategory = await subCategory.findOneAndDelete({ number: subCategoryNumberInt });

        // 소분류 카테고리를 찾지 못한 경우
        if (!deletedSubCategory) {
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
