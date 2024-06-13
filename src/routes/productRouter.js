const express = require('express');
const router = express.Router();
const { Product, Image } = require('../data');
const multer = require('multer');
const path = require('path');

// 이미지 파일 저장소
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'productImages/');
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     },
// });

// const upload = multer({ storage: storage });
// upload.single('file');
// 상품 추가
router.post('/', async (req, res, next) => {
    try {
        // const uploadImage = new Image({
        //     filename: number,
        //     path: req.file.path,
        //     originalName: req.file.originalname,
        // });
        // await file.save();

        const { number, name, price, stock, information, origin, categoryNumber, subCategoryNumber } = req.body;

        // number가 number type이 아닐 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(Number(number))) {
            const err = new Error('상품 번호는 숫자값이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }
        // 상품명이 String type이 아니거나 빈 값일 경우 에러 핸들러로 에러 보냄
        if (typeof name !== 'string' || name === '') {
            const err = new Error('상품명은 문자열 값이며 빈 값이 아니어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 상품 가격이 number type이 아니거나 음수일 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(Number(price)) || Number(price) < 0) {
            const err = new Error('상품 가격은 숫자값이어야 하고 양수여야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 상품 재고가 number type이 아니거나 음수일 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
            const err = new Error('상품 재고는 숫자값이어야 하고 양수여야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 상품 이미지가 buffer 타입이 아니거나 없을 경우 에러 핸들러로 에러 보냄
        // if (typeof image !== 'string') {
        //     const err = new Error('상품 이미지는 buffer 타입이어야 하고 존재해야 합니다.');
        //     err.statusCode = 400;
        //     return next(err);
        // }

        // 대분류 카테고리가 number type이 아닐 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(Number(categoryNumber))) {
            const err = new Error('대분류 카테고리는 숫자값이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }
        // 소분류 카테고리가 number type이 아닐 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(Number(subCategoryNumber))) {
            const err = new Error('소분류 카테고리는 숫자값이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        const data = await Product.create({
            number: Number(number),
            name,
            price: Number(price),
            stock: Number(stock),
            information,
            origin,
            image: uploadImage.path,
            categoryNumber: Number(categoryNumber),
            subCateogryNumber: Number(subCategoryNumber),
        });

        console.log(uploadImage.filename);

        res.status(201).json({
            err: null,
            data: {
                number: data.number,
                name: data.name,
                price: data.price,
                stock: data.stock,
                information: data.information,
                origin: data.origin,
                image: data.image,
                categoryNumber: data.categoryNumber,
                subCateogryNumber: data.subCateogryNumber,
            },
        });
    } catch (e) {
        next(e);
    }
});

// 상품 수정
router.put('/:productNumber', async (req, res, next) => {
    try {
        const { productNumber } = req.params;
        const { number, name, price, stock, information, image, categoryNumber, subCategoryNumber } = req.body;

        // productNumber가 number type이 아닐 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(Number(productNumber))) {
            const err = new Error('요청하는 페이지를 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }

        const foundProduct = await Product.findOne({ productNumber: Number(productNumber) }).lean();
        // productNumber에 해당하는 상품을 찾지 못할 경우 에러 핸들러로 에러 보냄
        if (foundProduct === null) {
            const err = new Error('요청하는 페이지를 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }
        if (!Number.isInteger(Number(number))) {
            const err = new Error('상품 번호는 숫자값이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }
        // 상품명이 String type이 아니거나 빈 값일 경우 에러 핸들러로 에러 보냄
        if (typeof name !== 'string' || name === '') {
            const err = new Error('상품명은 문자열 값이며 빈 값이 아니어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }
        // 상품 가격이 number type이 아니거나 음수일 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(Number(price)) || Number(price) < 0) {
            const err = new Error('상품 가격은 숫자값이어야 하고 양수여야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 상품 재고가 number type이 아니거나 음수일 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
            const err = new Error('상품 재고는 숫자값이어야 하고 양수여야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 상품 이미지가 buffer 타입이 아니거나 없을 경우 에러 핸들러로 에러 보냄
        if (typeof image !== 'string') {
            const err = new Error('상품 이미지는 buffer 타입이어야 하고 존재해야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 대분류 카테고리가 number type이 아닐 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(Number(categoryNumber))) {
            const err = new Error('대분류 카테고리는 숫자값이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }
        // 소분류 카테고리가 number type이 아닐 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(Number(subCategoryNumber))) {
            const err = new Error('소분류 카테고리는 숫자값이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        const data = await Product.updateOne(
            { productNumber: Number(productNumber) },
            {
                number: Number(number),
                name,
                price: Number(price),
                stock: Number(stock),
                information,
                image,
                categoryNumber: Number(categoryNumber),
                subCategoryNumber: Number(subCategoryNumber),
            }
        );
        res.status(201).json({ err: null, data: data });
    } catch (e) {
        next(e);
    }
});

// 상품 삭제
router.delete('/:productNumber', async (req, res, next) => {
    const { productNumber } = req.params;
    if (!Number.isInteger(Number(productNumber))) {
        const err = new Error('요청하는 페이지를 찾을 수 없습니다.');
        err.statusCode = 404;
        return next(err);
    }
    const foundData = await Product.findOne({ productNumber: Number(productNumber) }).lean();
    if (foundData === null) {
        const err = new Error('요청하는 페이지를 찾을 수 없습니다.');
        err.statusCode = 404;
        return next(err);
    }

    await Product.delete({ productNumber: Number(productNumber) });
    res.status(204).json({ err: null, data: '해당 상품을 삭제하였습니다.' });
});
module.exports = router;
