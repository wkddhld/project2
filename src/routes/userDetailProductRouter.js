const express = require('express');

const router = express.Router();
const { Product, Category, SubCategory } = require('../data');

// 상품 상세 라우터
router.get('/:productNumber', async (req, res, next) => {
  try {
    const { productNumber } = req.params;

    // productNumber와 일치하는 상품이 없는 경우
    const foundData = await Product.findOne({
      number: Number(productNumber),
    }).lean();

    if (!Number.isInteger(Number(productNumber)) || foundData === null) {
      const err = new Error('요청하신 상품을 찾을 수 없습니다.');
      err.statusCode = 404;
      return next(err);
    }

    // 서로 독립적인 관계라 Promise.all로 동시에 부름
    const [category, subcategory] = await Promise.all([
      Category.findOne({ number: foundData.categoryNumber }).lean(),
      SubCategory.findOne({ number: foundData.subCategoryNumber }).lean(),
    ]);

    res.json({
      err: null,
      data: {
        name: foundData.name,
        price: foundData.price,
        quantity: foundData.quantity,
        image: foundData.image,
        information: foundData.information,
        origin: foundData.origin,
        categoryNumber: category.number,
        categoryName: category.name,
        subCategoryNumber: subcategory.number,
        subCategoryName: subcategory.name,
      },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
