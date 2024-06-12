const express = require('express');
const router = express.Router();
const { subCategory,Product } = require('../data'); 


// 소분류 카테고리 조회
router.get('/:categoryNum/:subcategoryNum', async (req, res, next) => {
    const { categoryNum, subcategoryNum } = req.params;

    const categoryNumInt = Number(categoryNum);
    const subcategoryNumInt = Number(subcategoryNum);
  
    console.log(`Received categoryNum: ${categoryNum}, subcategoryNum: ${subcategoryNum}`);
    console.log(`Parsed categoryNumInt: ${categoryNumInt}, subcategoryNumInt: ${subcategoryNumInt}`);
    console.log(`Is categoryNumInt integer: ${Number.isInteger(categoryNumInt)}, Is subcategoryNumInt integer: ${Number.isInteger(subcategoryNumInt)}`);
 
 
    if (!Number.isInteger(Number(categoryNum)) || !Number.isInteger(Number(subcategoryNum))) {
        const err = new Error('categoryNumber field는 number type이어야 합니다.');
        err.statusCode = 400;
        next(err);
        return;
    }
    try {
        // categoryNum과 scategoryNum에 해당하는 소분류 카테고리 조회
        const subCate = await subCategory.findOne({ 
          mainCategoryNumber: categoryNumInt,
          number: subcategoryNumInt
        }).lean();

        if (!subCate) {
            const err = new Error('해당 소분류 카테고리를 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }
        const products = await Product.find({
            categoryNumber: categoryNumInt,
            subCateogryNumber: subcategoryNumInt
        }).lean()

        return res.json({
            data: {
                subcategory_name: subCate.name,
                products: products.map(prod => ({
                    image: prod.image,
                    name: prod.name,
                    price: prod.price
                }))
            }
        });
    } catch (e) {
        next(e);
    }
});

module.exports = router;