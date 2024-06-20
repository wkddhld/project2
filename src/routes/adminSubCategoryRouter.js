const express = require('express');

const router = express.Router();
const { SubCategory, Category, Product } = require('../data');

const fs = require('fs');

// 소분류 카테고리 추가
router.post('/', async (req, res, next) => {
  try {
    const { subCategoryNumber, subCategoryName, categoryNumber } = req.body;

    // 수정하려는 대분류 카테고리 번호가 숫자값이 아니거나 1자리 숫자가 아닌경우
    if (!Number.isInteger(categoryNumber) || categoryNumber.toString().length !== 1) {
      const err = new Error('대분류 카테고리는 1자리  숫자이어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 수정하려는 대분류 카테고리 번호가 db에 존재하는지 체크
    const existingCategory = await Category.findOne({
      number: categoryNumber,
    }).lean();
    if (existingCategory === null || existingCategory === undefined) {
      const err = new Error('존재하지 않는 대분류 카테고리입니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 소분류 카테고리가 3자리가 아니거나 숫자값이 아닌 경우
    if (!Number.isInteger(Number(subCategoryNumber)) || subCategoryNumber.toString().length !== 3) {
      const err = new Error('소분류 카테고리는 3자리 숫자이어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 소분류 카테고리 이름이 문자열이 아니거나 빈 값인 경우
    if (
      typeof subCategoryName !== 'string' ||
      subCategoryName === '' ||
      subCategoryName.trim() === ''
    ) {
      const err = new Error('소분류 카테고리 이름은 문자열이거나 빈 값이 아니어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 추가하려는 소분류 카테고리 이름이 DB에 존재할 경우
    const existingSubCategoryByName = await SubCategory.findOne({
      name: subCategoryName,
    }).lean();
    if (existingSubCategoryByName) {
      const err = new Error('동일한 이름의 소분류 카테고리가 있습니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 새로운 소분류 카테고리 생성
    const newSubCategory = await SubCategory.create({
      number: subCategoryNumber,
      name: subCategoryName,
      mainCategoryNumber: categoryNumber,
    });

    // 성공적으로 생성된 경우 응답 반환
    return res.status(201).json({
      err: null,
      data: {
        subCategoryName: newSubCategory.name,
        subCategoryNumber: newSubCategory.number,
        mainCategoryNumber: newSubCategory.mainCategoryNumber,
      },
    });
  } catch (e) {
    next(e);
  }
});

// 소분류 카테고리 수정
router.put('/:subCategoryNumber', async (req, res, next) => {
  try {
    const { subCategoryNumber } = req.params; // URL 파라미터에서 subCategoryNumber 추출
    const { subCategoryName } = req.body; // 요청 본문에서 새로운 subCategoryNumber, subCategoryName 추출

    const foundSubCategory = await SubCategory.findOne({
      number: Number(subCategoryNumber),
    }).lean();
    // 소분류 카테고리 번호가 3자리가 아니거나 숫자값이 아니거나 소분류 카테고리 db에 존재하지 않는 경우
    if (
      !Number.isInteger(Number(subCategoryNumber)) ||
      subCategoryNumber.toString().length !== 3 ||
      foundSubCategory === null ||
      foundSubCategory === undefined
    ) {
      const err = new Error('존재하지 않는 소분류 카테고리입니다.');
      err.statusCode = 404;
      return next(err);
    }

    if (
      typeof subCategoryName !== 'string' ||
      subCategoryName === '' ||
      subCategoryName.trim() === ''
    ) {
      const err = new Error('소분류 카테고리 이름은 문자열이거나 빈 값이 아니어야 합니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 수정하려는 소분류 카테고리 이름이 DB에 존재할 경우
    const existingSubCategoryByName = await SubCategory.findOne({
      name: subCategoryName,
    }).lean();
    if (existingSubCategoryByName) {
      const err = new Error('동일한 이름의 소분류 카테고리가 있습니다.');
      err.statusCode = 400;
      return next(err);
    }

    // 수정된 소분류 카테고리 정보 업데이트
    await SubCategory.updateOne({ number: Number(subCategoryNumber) }, { name: subCategoryName });

    return res.status(201).json({
      err: null,
      data: {
        subCategoryName: subCategoryName,
      },
    });
  } catch (e) {
    next(e);
  }
});

// 소분류 카테고리 삭제
router.delete('/:subCategoryNumber', async (req, res, next) => {
  try {
    const { subCategoryNumber } = req.params; // URL 파라미터에서 subCategoryNumber 추출

    // 삭제하려는 소분류 카테고리가 DB에 존재하지 않는 경우
    const foundSubCategory = await SubCategory.findOne({
      number: Number(subCategoryNumber),
    }).lean();
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

    // 소분류 카테고리에 속하는 상품들
    const foundProduct = await Product.find({
      subCategoryNumber: Number(subCategoryNumber),
    }).lean();

    // foundProduct에 속하는 모든 이미지 파일 저장소에서 삭제
    foundProduct.forEach((product) => {
      fs.unlinkSync('src/productImages/' + product.image);
    });

    // subCategoryNumber에 해당하는 소분류 카테고리를 삭제
    await Promise.all([
      // 소분류 카테고리에 해당하는 상품 삭제
      Product.deleteMany({ subCategoryNumber: foundSubCategory.number }),
      // 소분류 카테고리 삭제
      SubCategory.deleteOne({ number: foundSubCategory.number }),
    ]);

    // 소분류 카테고리에 해당하는 상품 삭제

    await Product.deleteMany({ subCategoryNumber: Number(subCategoryNumber) });

    return res.status(204).json();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
