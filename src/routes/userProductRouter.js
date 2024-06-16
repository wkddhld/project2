const express = require('express');
const router = express.Router();
const { Product, Category, SubCategory } = require('../data');

// 대분류 카테고리별 상품 조회
router.get('/:categoryNumber', async (req, res, next) => {
    try {
        const { categoryNumber } = req.params;

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

        // categoryNumber에 해당하는 상품 조회
        const categoryProducts = await Product.find({ categoryNumber: Number(categoryNumber) }).lean();

        // 해당 카테고리의 상품이 없는 경우
        if (!categoryProducts || categoryProducts.length === 0) {
            const err = new Error('해당 대분류 카테고리의 상품을 찾을 수 없습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }

        // 상품 데이터 반환
        return res.json({
            err: null,
            data: categoryProducts.map((product) => ({
                name: product.name,
                price: product.price,
                image: product.image,
            })),
        });
    } catch (e) {
        next(e);
    }
});

// 소분류 카테고리별 상품 조회
router.get('/:categoryNumber/:subCategoryNumber', async (req, res, next) => {
    const { categoryNumber, subCategoryNumber } = req.params;

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

    const foundSubCategory = await SubCategory.findOne({ number: Number(subCategoryNumber) }).lean();
    // 소분류 카테고리가 3자리가 아니거나 숫자값이 아니거나 소분류 카테고리 DB에 존재하지 않는 경우
    if (
        !Number.isInteger(Number(subCategoryNumber)) ||
        subCategoryNumber.length !== 3 ||
        foundSubCategory === null ||
        foundSubCategory === undefined
    ) {
        const err = new Error('존재하지 않는 소분류 카테고리입니다.');
        err.statusCode = 404;
        next(err);
        return;
    }

    try {
        // 조회하려는 subCategory가 categoryNumber에 속해있는지 확인
        // 소분류 카테고리가 대분류 카테고리에 포함되지 않는 경우
        if (foundSubCategory.mainCategoryNumber !== foundCategory.number) {
            const err = new Error('페이지를 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }

        const products = await Product.find({ subCategoryNumber: foundSubCategory.number }).lean();

        return res.json({
            err: null,
            data: {
                subCategoryName: foundSubCategory.name,
                products: products.map((prod) => {
                    return { image: prod.image, name: prod.name, price: prod.price };
                }),
            },
        });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
