const express = require('express');
const router = express.Router();
const { Product, Category, SubCategory } = require('../data');
const multer = require('multer');
const path = require('path');
const { customAlphabet } = require('nanoid');
const fs = require('fs');

// 0-9 랜덤으로 4자리 숫자 만들어주는 코드
const randomNumber = '0123456789';
const nanoid = customAlphabet(randomNumber, 4);

function generateNumericOrderNumber() {
    return nanoid();
}

// 이미지 파일 저장소
const storage = multer.diskStorage({
    // 저장한 공간 정보 : 하드디스크에 저장
    destination: function (req, file, cb) {
        // 저장 위치
        cb(null, 'src/productImages/'); // 이미지 파일 저장 경로 설정
    },
    // 저장할 파일 이름
    filename: function (req, file, cb) {
        // 파일명을 어떤 이름으로 올릴지
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });
// 상품 조회
router.get('/', async (req, res, next) => {
    try {
        // 모든 상품 정보 조회
        const products = await Product.find({}).lean();

        res.json({ err: null, data: products });
    } catch (e) {
        next(e);
    }
});

// 상품 추가
// 파일을 하나만 업로드하기 때문에 single 미들웨어 사용
router.post('/', upload.single('file'), async (req, res, next) => {
    try {
        // 텍스트 데이터들은 req.body로 받음
        const { name, price, stock, information, origin, categoryNumber, subCategoryNumber } = req.body;
        console.log("오류");
        // 파일이 없을 경우 에러처리
        if (!req.file) {
            const err = new Error('이미지 업로드해주세요.');
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
            const err = new Error('상품 가격은 양수의 숫자이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 상품 재고가 number type이 아니거나 음수일 경우
        if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
            const err = new Error('상품 재고는 상품 가격은 양수의 숫자이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        const foundCategory = await Category.findOne({ number: Number(categoryNumber) }).lean();
        // 대분류 카테고리가 2자리 초과이거나 숫자값이 아니거나 DB에 존재하지 않는 경우
        if (
            !Number.isInteger(Number(categoryNumber)) ||
            categoryNumber.length > 2 ||
            foundCategory === null ||
            foundCategory === undefined
        ) {
            const err = new Error('존재하지 않는 대분류 카테고리입니다.');
            err.statusCode = 400;
            return next(err);
        }
        const foundSubCategory = await SubCategory.findOne({ number: Number(categoryNumber) }).lean();
        // 소분류 카테고리가 3자리가 아니거나 숫자값이 아니거나 DB에 존재하지 않는 경우
        if (
            !Number.isInteger(Number(subCategoryNumber)) ||
            subCategoryNumber.length !== 3 ||
            foundSubCategory === null ||
            foundSubCategory === undefined
        ) {
            const err = new Error('존재하지 않는 소분류 카테고리입니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 상품 번호(업로드한 날짜 + 랜덤 4자리 숫자)
        const number = Date.now() + generateNumericOrderNumber();


        // 상품 정보 db에 저장
        const data = await Product.create({
            number: Number(number),
            name,
            price: Number(price),
            stock: Number(stock),
            information,
            origin,
            image: req.file.filename,
            categoryNumber: Number(categoryNumber),
            subCategoryNumber: Number(subCategoryNumber),
        });
        

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
                subCategoryNumber: data.subCategoryNumber,
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
        const { name, price, stock, information, categoryNumber, subCategoryNumber } = req.body;

        // productNumber가 number type이 아닐 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(Number(productNumber))) {
            const err = new Error('요청하는 상품을 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }

        const foundProduct = await Product.findOne({ number: Number(productNumber) }).lean();
        // productNumber에 해당하는 상품을 찾지 못할 경우 에러 핸들러로 에러 보냄
        if (foundProduct === null) {
            const err = new Error('요청하는 상품을 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }

        // 상품명이 String type이 아니거나 빈 값일 경우 에러 핸들러로 에러 보냄
        if (typeof name !== 'string' || name === '') {
            const err = new Error('상품명은 문자열이며 빈 값이 아니어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 상품 가격이 number type이 아니거나 음수일 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(Number(price)) || Number(price) < 0) {
            const err = new Error('상품 가격은 양수의 숫자이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 상품 재고가 number type이 아니거나 음수일 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
            const err = new Error('상품 재고는 양수의 숫자이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        const foundCategory = await Category.findOne({ number: Number(categoryNumber) }).lean();
        // 대분류 카테고리가 2자리 초과이거나 숫자값이 아니거나 DB에 존재하지 않는 경우
        if (
            !Number.isInteger(Number(categoryNumber)) ||
            categoryNumber.length > 2 ||
            foundCategory === null ||
            foundCategory === undefined
        ) {
            const err = new Error('존재하지 않는 대분류 카테고리입니다.');
            err.statusCode = 400;
            return next(err);
        }
        const foundSubCategory = await SubCategory.findOne({ number: Number(subCategoryNumber) }).lean();
        // 소분류 카테고리가 3자리가 아니거나 숫자값이 아니거나 DB에 존재하지 않는 경우
        if (
            !Number.isInteger(Number(subCategoryNumber)) ||
            subCategoryNumber.length !== 3 ||
            foundSubCategory === null ||
            foundSubCategory === undefined
        ) {
            const err = new Error('존재하지 않는 소분류 카테고리입니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 새로운 상품 번호 생성
        const newProductNumber = Date.now() + generateNumericOrderNumber();

        // 요청하는 데이터에 이미지 파일이 존재하는 경우

        if (req.files.file) {
            const filename = req.files.file.fieldName + '-' + req.files.file.name;

            // 변경하려는 이미지 업로드
            fs.linkSync('src/productImages/' + foundProduct.image, 'src/productImages/' + filename);

            // 변경하려는 상품의 이미지 찾아서 지우는 코드
            fs.unlinkSync('src/productImages/' + foundProduct.image);

            const updateData = await Product.updateOne(
                { number: Number(productNumber) },
                {
                    number: Number(newProductNumber),
                    name,
                    price: Number(price),
                    stock: Number(stock),
                    image: filename,
                    information,
                    categoryNumber: Number(categoryNumber),
                    subCategoryNumber: Number(subCategoryNumber),
                }
            );
            return res.status(201).json({ err: null, data: updateData });
        }
        // 상품 업데이트
        const data = await Product.updateOne(
            { number: Number(productNumber) },
            {
                number: Number(newProductNumber),
                name,
                price: Number(price),
                stock: Number(stock),
                information,
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

    // productNumber가 숫자값이 아닌 경우
    if (!Number.isInteger(Number(productNumber))) {
        const err = new Error('요청하는 상품을 찾을 수 없습니다.');
        err.statusCode = 404;
        return next(err);
    }

    // productNumber에 해당하는 상품이 없을 경우
    const foundData = await Product.findOne({ number: Number(productNumber) }).lean();
    if (foundData === null || foundData === undefined) {
        const err = new Error('요청하는 상품을 찾을 수 없습니다.');
        err.statusCode = 404;
        return next(err);
    }

    // 삭제하려는 상품의 이미지 찾아서 지우는 코드
    fs.unlinkSync('src/productImages/' + foundData.image);

    // productNumber와 일치하는 이미지와 상품 삭제
    await Product.deleteOne({ number: Number(productNumber) });
    res.status(204).json();
});
module.exports = router;
