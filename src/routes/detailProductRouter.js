const express = require('express');
const router = express.Router();
const { Product } = require('../data');

// 상품 상세 라우터
router.get('/:productNumber', async (req, res, next) => {
    try {
        const { productNumber } = req.params;
        // productNumber가 number type이 아닐 경우
        if (!Number.isInteger(Number(productNumber))) {
            const err = new Error('요청하신 페이지를 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }

        // productNumber와 일치하는 상품이 없는 경우
        const foundData = await Product.findOne({ productNumber: Number(productNumber) }).lean();
        if (foundData === null) {
            const err = new Error('요청하신 페이지를 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }

        const { categoryNumber, subCategoryNumber } = req.query;
        // 대분류 카테고리 번호와 소분류 카테고리 번호가 같이 있는 경우 에러 처리
        if (
            categoryNumber !== undefined &&
            categoryNumber !== null &&
            subCategoryNumber !== undefined &&
            subCategoryNumber !== null
        ) {
            const err = new Error('대분류 카테고리 또는 소분류 카테고리 둘 중 하나만 사용 가능합니다.');
            err.statusCode = 400;
            return next(err);
        }

        if (categoryNumber !== undefined && categoryNumber !== null) {
            // 대분류 카테고리의 data type이 number가 아닌 경우
            if (!Number.isInteger(Number(categoryNumber))) {
                const err = new Error('대분류 카테고리 번호는 숫자형 타입이어야 합니다.');
                err.statusCode = 400;
                return next(err);
            }
            const foundData = await Product.findOne({ categoryNumber: Number(categoryNumber) }).lean();
            // 대분류 카테고리로 찾은 상품 데이터가 없는 경우
            if (foundData === null) {
                const err = new Error('해당 대분류 카테고리에 속하지 않는 상품입니다.');
                err.statusCode = 400;
                return next(err);
            }
            return res.json({
                name: foundData.name,
                price: foundData.price,
                information: foundData.information,
                origin: foundData.origin,
                image: foundData.image,
            });
        }

        if (subCategoryNumber !== undefined && subCategoryNumber !== null) {
            // 소분류 카테고리의 data type이 number가 아닌 경우
            if (!Number.isInteger(Number(subCategoryNumber))) {
                const err = new Error('소분류 카테고리 번호는 숫자형 타입이어야 합니다.');
                err.statusCode = 400;
                return next(err);
            }
            const foundData = await Product.findOne({ subCateogryNumber: Number(subCategoryNumber) }).lean();
            // 소분류 카테고리로 찾은 상품 데이터가 없을 경우
            if (foundData === null) {
                const err = new Error('해당 소분류 카테고리에 속하지 않는 상품입니다.');
                err.statusCode = 400;
                return next(err);
            }
            return res.json({
                name: foundData.name,
                price: foundData.price,
                information: foundData.information,
                origin: foundData.origin,
                image: foundData.image,
            });
        }
    } catch (e) {
        next(e);
    }
});
