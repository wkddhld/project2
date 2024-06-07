const express = require('express');
const router = express.Router();
const Category = require('../data/models/Category');
//const authenticateAdmin = require('../middlewares/authenticateAdmin');

// 대분류 카테고리 추가
router.post('/', async (req, res) => {
    console.log('Request Body:', req.body); // 요청 본문을 콘솔에 출력

    const { categoryNum, categoryName } = req.body; // 요청 본문에서 categoryNum과 categoryName 추출

    try {
        // 동일한 categoryNum을 가진 카테고리가 이미 존재하는지 확인
        const existingCategory = await Category.findOne({ categoryNum: Number(categoryNum) });
        if (existingCategory) {
            return res.status(400).json({ error: "이미 존재하는 카테고리입니다.", data: null });
        }
          // 새로운 카테고리 생성
        const newCategory = await Category.create({ categoryNum: categoryNum, categoryName });
        // 성공적으로 생성된 경우 응답 반환
        return res.status(201).json({ error: null, data: { categoryName: newCategory.categoryName, categoryNum: newCategory.categoryNum } });
   
   
    } catch (error) {
        console.error("서버 오류:", error); // 서버 오류 콘솔에 출력
        console.error(error); // 실제 오류 메시지를 로그에 출력
        return res.status(500).json({ error: "서버 오류입니다.", data: null });
    }
});



// 대분류 카테고리 수정
router.put('/:categoryNum', async (req, res) => {
    const { categoryNum } = req.params; // URL 파라미터에서 categoryNum 추출
    const { categoryNum: newCategoryNum, categoryName } = req.body;  // 요청 본문에서 새로운 categoryNum과 categoryName 추출

    try {
        // categoryNum에 해당하는 카테고리를 찾고 업데이트
        const category = await Category.findOneAndUpdate(
            { categoryNum: Number(categoryNum) },
            { categoryNum: newCategoryNum, categoryName },
            { new: true } // 업데이트된 문서를 반환하도록 설정
        );

        if (!category) {
            return res.status(404).json({ error: "잘못된 접근입니다.", data: null });// 카테고리를 찾지 못한 경우 에러 응답 반환
        }

        return res.status(200).json({ error: null, data: { categoryName: category.categoryName, categoryNum: category.categoryNum } });
    } catch (error) {
        console.error("서버 오류:", error);// 서버 오류 콘솔에 출력
        return res.status(500).json({ error: "서버 오류입니다.", data: null });// 서버 오류 응답 반환
    
    }
});


// 대분류 카테고리 삭제
router.delete('/:categoryNum', async (req, res) => {
    const { categoryNum } = req.params; // URL 파라미터에서 categoryNum 추출

    try {
        // categoryNum에 해당하는 카테고리를 찾고 삭제
        const category = await Category.findOneAndDelete({ categoryNum: Number(categoryNum) });

        if (!category) { // 카테고리를 찾지 못한 경우 에러 응답 반환
            return res.status(404).json({ error: "해당 카테고리번호에 맞는 카테고리가 없습니다.", data: null });
        }

        return res.status(201).json({ error: null, data: "정상적으로 카테고리가 삭제되었습니다." });
    } catch (error) {
        console.error("서버 오류:", error);
        return res.status(500).json({ error: "서버 오류입니다.", data: null }); // 서버 오류 응답 반환
    }
});

module.exports = router; 
