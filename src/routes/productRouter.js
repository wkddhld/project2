const express = require('express');
const router = express.Router();
const { Product, Image } = require('../data');
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

// 상품 추가
// 파일을 하나만 업로드하기 때문에 single 미들웨어 사용
router.post('/', upload.single('file'), async (req, res, next) => {
    try {
        // 파일이 없을 경우 에러처리
        if (!req.file) {
            const err = new Error('이미지 업로드해주세요.');
            err.statusCode = 400;
            return next(err);
        }
        // 텍스트 데이터들은 req.body로 받음
        const { name, price, stock, information, origin, categoryNumber, subCategoryNumber } = req.body;

        // 상품명이 String type이 아니거나 빈 값일 경우 에러 핸들러로 에러 보냄
        if (typeof name !== 'string' || name === '') {
            const err = new Error('상품명은 문자열 값이며 빈 값이 아니어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 상품 가격이 number type이 아니거나 음수일 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(price) || price < 0) {
            const err = new Error('상품 가격은 숫자값이어야 하고 양수여야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 상품 재고가 number type이 아니거나 음수일 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(stock) || stock < 0) {
            const err = new Error('상품 재고는 숫자값이어야 하고 양수여야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 대분류 카테고리가 number type이 아닐 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(categoryNumber)) {
            const err = new Error('대분류 카테고리는 숫자값이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }
        // 소분류 카테고리가 number type이 아닐 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(subCategoryNumber)) {
            const err = new Error('소분류 카테고리는 숫자값이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }
        // 상품 번호(업로드한 날짜 + 랜덤 4자리 숫자)
        const number = Date.now() + generateNumericOrderNumber();

        const file = req.file; // 이미지
        // 업로드한 이미지 정보 db에 저장
        const uploadImage = await Image.create({
            filename: Number(number),
            path: file.path,
            originalName: file.originalname,
        });

        // 상품 정보 db에 저장
        const data = await Product.create({
            number: Number(number),
            name,
            price,
            stock,
            information,
            origin,
            image: uploadImage.path,
            categoryNumber,
            subCategoryNumber,
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
router.put('/:productNumber', upload.single('file'), async (req, res, next) => {
    try {
        const { productNumber } = req.params;

        // productNumber가 number type이 아닐 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(Number(productNumber))) {
            const err = new Error('요청하는 페이지를 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }

        // 변경하려는 상품의 이미지가 없을 경우
        if (!req.file) {
            const err = new Error('이미지 업로드해주세요.');
            err.statusCode = 400;
            return next(err);
        }

        const { name, price, stock, information, categoryNumber, subCategoryNumber } = req.body;

        const foundProduct = await Product.findOne({ number: Number(productNumber) }).lean();
        // productNumber에 해당하는 상품을 찾지 못할 경우 에러 핸들러로 에러 보냄
        if (foundProduct === null) {
            const err = new Error('요청하는 페이지를 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }

        // 상품명이 String type이 아니거나 빈 값일 경우 에러 핸들러로 에러 보냄
        if (typeof name !== 'string' || name === '') {
            const err = new Error('상품명은 문자열 값이며 빈 값이 아니어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }
        // 상품 가격이 number type이 아니거나 음수일 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(price) || price < 0) {
            const err = new Error('상품 가격은 숫자값이어야 하고 양수여야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 상품 재고가 number type이 아니거나 음수일 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(stock) || stock < 0) {
            const err = new Error('상품 재고는 숫자값이어야 하고 양수여야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 대분류 카테고리가 number type이 아닐 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(categoryNumber)) {
            const err = new Error('대분류 카테고리는 숫자값이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }
        // 소분류 카테고리가 number type이 아닐 경우 에러 핸들러로 에러 보냄
        if (!Number.isInteger(subCategoryNumber)) {
            const err = new Error('소분류 카테고리는 숫자값이어야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // 변경하려는 상품의 이미지 찾아서 지우는 코드
        const exist = await Image.findOne({ filename: Number(productNumber) }).lean();
        fs.unlinkSync(exist.path);

        // 새로운 상품 번호 생성
        const newProductNumber = Date.now() + generateNumericOrderNumber();

        // 변경하려는 상품의 이미지 업데이트
        await Image.updateOne(
            { filename: Number(productNumber) },
            { filename: Number(newProductNumber), path: req.file.path, originalName: req.file.originalname }
        );

        // 상품 업데이트
        const data = await Product.updateOne(
            { number: Number(productNumber) },
            {
                number: Number(newProductNumber),
                name,
                price,
                stock,
                information,
                image: req.file.path,
                categoryNumber,
                subCategoryNumber,
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
        const err = new Error('요청하는 페이지를 찾을 수 없습니다.');
        err.statusCode = 404;
        return next(err);
    }
    // productNumber에 해당하는 상품이 없을 경우
    const foundData = await Product.findOne({ number: Number(productNumber) }).lean();
    if (foundData === null) {
        const err = new Error('요청하는 페이지를 찾을 수 없습니다.');
        err.statusCode = 404;
        return next(err);
    }

    // 삭제하려는 상품의 이미지 찾아서 지우는 코드
    const exist = await Image.findOne({ filename: Number(productNumber) }).lean();
    fs.unlinkSync(exist.path);

    // productNumber와 일치하는 이미지와 상품 삭제
    await Product.deleteOne({ number: Number(productNumber) });
    await Image.deleteOne({ filename: Number(productNumber) });
    res.status(204).json({ err: null, data: '해당 상품을 삭제하였습니다.' });
});
module.exports = router;
