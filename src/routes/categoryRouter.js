const express = require('express');

const router = express.Router();
const { Category } = require('../data');

// 모든 대분류와 소분류 카테고리 데이터 조회
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find().populate('subCategories').lean();

    const categoriesWithSubCategories = categories.map((category) => ({
      categoryNumber: category.number,
      categoryName: category.name,
      subCategories: category.subCategories.map((subCategory) => ({
        subCategoryName: subCategory.name,
        subCategoryNumber: subCategory.number,
      })),
    }));

    res.json({ err: null, data: categoriesWithSubCategories });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
