const express = require('express');
const router = express.Router();
const { Product, subCategory, Category } = require('../data');

// 모든 대분류와 소분류 카테고리 데이터 조회
router.get('/', async (req, res, next) => {
    try {
        // 대분류 카테고리 조회
        const categories = await Category.find().lean();

        // 각 대분류 카테고리에 해당하는 소분류 카테고리 조회 및 매핑
        const categoriesWithSubCategories = await Promise.all(
            categories.map(async (category) => {
                const subCategories = await subCategory.find({ mainCategoryNumber: category.number }).lean();
                return {
                    categoryNumber: category.number,
                    categoryName: category.name,
                    subCategories: subCategories.map((subCategory) => ({
                        subCategoryName: subCategory.name,
                        subCategoryNumber: subCategory.number,
                    })),
                };
            })
        );

        res.json({ err: null, data: categoriesWithSubCategories });
    } catch (e) {
        next(e);
    }
});

// 대분류 카테고리별 상품 조회
router.get('/:categoryNumber', async (req, res, next) => {
    try {
        const { categoryNumber } = req.params;

        // categoryNumber가 숫자인지 확인
        if (!Number.isInteger(Number(categoryNumber)) || categoryNumber.length > 2) {
            const err = new Error('대분류 카테고리는 숫자값이면서 2자리 이하여야 합니다.');
            err.statusCode = 400;
            next(err);
            return;
        }

        // categoryNumber에 해당하는 상품 조회
        const categoryProducts = await Product.find({ categoryNumber: Number(categoryNumber) }).lean();

        // 해당 카테고리의 상품이 없는 경우
        if (!categoryProducts || categoryProducts.length === 0) {
            const err = new Error('해당 카테고리의 상품을 찾을 수 없습니다.');
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

    if (!Number.isInteger(Number(categoryNumber)) || categoryNumber.length > 2) {
        const err = new Error('대분류 카테고리는 숫자값이면서 2자리 이하여야 합니다.');
        err.statusCode = 400;
        next(err);
        return;
    }

    if (!Number.isInteger(Number(subCategoryNumber)) || subCategoryNumber.length !== 3) {
        const err = new Error('소분류 카테고리는 숫자값이면서 3자리여야 합니다.');
        err.statusCode = 400;
        next(err);
        return;
    }

    try {
        // categoryNumber과 subCategoryNumber에 해당하는 소분류 카테고리 조회
        const subCate = await subCategory
            .findOne({
                mainCategoryNumber: Number(categoryNumber),
                number: Number(subCategoryNumber),
            })
            .lean();

        if (!subCate) {
            const err = new Error('해당 소분류 카테고리를 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }

        const products = await Product.find({
            categoryNumber: Number(categoryNumber),
            subCateogryNumber: Number(subCategoryNumber),
        }).lean();

        return res.json({
            err: null,
            data: {
                subCategoryName: subCate.name,
                products: products.map((prod) => ({
                    image: prod.image,
                    name: prod.name,
                    price: prod.price,
                })),
            },
        });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
