const express = require('express');
const router = express.Router();
const { subCategory, Category } = require('../data');

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

module.exports = router;
