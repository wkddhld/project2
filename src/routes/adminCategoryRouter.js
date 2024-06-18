const express = require('express');
const router = express.Router();
const { Category, SubCategory, Product } = require('../data');
const fs = require('fs');


// 대분류 카테고리 추가
router.post('/', async (req, res, next) => {
    try {
        const { categoryNumber, categoryName } = req.body; // 요청 본문에서 categoryNum과 categoryName 추출
        // 추가하려는 대분류 카테고리 이름이 DB에 존재할 경우
        const existingCategoryName = await Category.findOne({ name: categoryName }).lean();
        if (existingCategoryName !== null) {
            const err = new Error('이미 존재하는 카테고리 이름 입니다.');
            err.statusCode = 400;
            return next(err);
        }
 
        // 추가하려는 대분류 카테고리 번호가 2자리 초과이거나 숫자값이 아닌 경우
        if (!Number.isInteger(categoryNumber) || categoryNumber.toString().length > 2) {
            const err = new Error('대분류 카테고리는 2자리 이하의 숫자이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 동일한 categoryNumber을 가진 카테고리가 이미 존재하는지 확인
        const existingCategory = await Category.findOne({ number: categoryNumber }).lean();
        if (existingCategory !== null) {
            const err = new Error('이미 존재하는 대분류 카테고리입니다.');
            err.statusCode = 400;
            return next(err);
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
    try {
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
            return next(err);
        }

        // 수정하려는 대분류 카테고리 번호가 2자리 초과이거나 숫자값이 아닌 경우
        if (!Number.isInteger(newCategoryNumber) || newCategoryNumber.toString().length > 2) {
            const err = new Error('대분류 카테고리는 2자리 이하의 숫자이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        const existingCategory = await Category.findOne({ number: newCategoryNumber });
        // 새로운 카테고리 번호가 현재 카테고리 번호와 다르고 수정하려는 카테고리 번호가 db에 존재하는 경우
        if (newCategoryNumber !== Number(categoryNumber) && existingCategory !== null) {
            const err = new Error('대분류 카테고리 번호를 변경할 수 없습니다.');
            err.statusCode = 400;
            return next(err);
        }

        // categoryNumber에 해당하는 카테고리를  업데이트
        await Category.updateOne(
            { number: Number(categoryNumber) },
            { number: newCategoryNumber, name: categoryName },
            { new: true } // 업데이트된 문서를 반환하도록 설정
        );

        return res.status(201).json({
            err: null,
            data: { categoryName, categoryNumber: newCategoryNumber },
        });
    } catch (e) {
        next(e);
    }
});

// 대분류 카테고리 삭제
router.delete('/:categoryNumber', async (req, res, next) => {
    try {
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
            return next(err);
        }
        // 대분류 카테고리에 속하는 상품들
        const foundProduct = await Product.find({ categoryNumber: Number(categoryNumber) }).lean();
        // foundProduct에 속하는 모든 이미지 파일 저장소에서 삭제
        foundProduct.forEach((product) => {
            fs.unlinkSync('src/productImages/' + product.image);
        });

        await Promise.all([
            // 대분류 카테고리에 속하는 상품 삭제
            Product.deleteMany({ categoryNumber: Number(categoryNumber) }),
            // 소분류 카테고리 삭제
            SubCategory.deleteMany({ mainCategoryNumber: Number(categoryNumber) }),
            // 대분류 카테고리 삭제
            Category.deleteOne({ number: Number(categoryNumber) }),
        ]);

        return res.status(204).json();
    } catch (e) {
        next(e);
    }
});

module.exports = router;
