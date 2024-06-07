const express = require('express');
const router = express.Router();
const Category = require('../data/models/Category');

// 대분류 카테고리 조회
router.get('/api/categories/:categoryNum', async (req, res) => {
    const { categoryNum } = req.params;

    try {
        const category = await Category.find({ categoryNum: Number(categoryNum) });

        if (!category) {
            return res.status(404).json({ error: "잘못된 접근입니다.", data: null });
        }

        return res.status(200).json({ error: null, data: { categoryName: category.categoryName, categoryNum: category.categoryNum } });
    } catch (error) {
        console.error("서버 오류:", error);
        return res.status(500).json({ error: "서버 오류입니다.", data: null });
    }
});

module.exports = router;
