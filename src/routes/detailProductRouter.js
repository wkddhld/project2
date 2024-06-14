const express = require('express');
const router = express.Router();
const { Product, Category, subCategory } = require('../data');

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
        const foundData = await Product.findOne({ number: Number(productNumber) }).lean();

        if (foundData === null) {
            const err = new Error('요청하신 페이지를 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }

        const category = await Category.findOne({ number: foundData.categoryNumber }).lean();
        const subcategory = await subCategory.findOne({ number: foundData.subCategoryNumber }).lean();

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
