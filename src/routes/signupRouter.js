const router = require('express').Router();
const { User } = require('../data');
const bcrypt = require('bcrypt');

router.get('/', async (req, res) => {
    res.json('회원가입 path');
});

router.post('/', async (req, res) => {
    const { newCategoryNum, categoryName } = req.body; 
    console.log('Request Body:', req.body); 
    try {
        const existingCategory = await Category.findOne({ categoryNum: Number(newCategoryNum) });
        if (existingCategory) {
            return res.status(400).json({ error: "이미 존재하는 카테고리입니다.", data: null });
        }
        
        const newCategory = await Category.create({ categoryNum: newCategoryNum, categoryName });

        return res.status(201).json({ error: null, data: { categoryName: newCategory.categoryName, categoryNum: newCategory.categoryNum } });
    } catch (error) {
        console.error("서버 오류:", error);
        return res.status(500).json({ error: "서버 오류입니다.", data: null });
    }
});

router.post('/check-email', async (req, res, next) => {
    try {
        const { email } = req.body;
        const dbEmail = await User.findOne({ userEmail: email });
        if (email === dbEmail.userEmail) {
            const err = new Error('이미 존재하는 email입니다.');
            err.statusCode = 400;
            throw err;
        }
        console.log(dbEmail);
        res.status(200).json(email);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
