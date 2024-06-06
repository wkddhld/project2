const express = require(express);
const router  = express.Router();
const Category = require('../models/Category')
router.use('/', sCategoryRouter);

router.get('/api/v1/categories/:categoryNumber',async(req,res)=>{
 const { categoryNumber } = req.params;
 
 try {
    const category = await Category.findOne({ categoryNumber: Number(categoryNumber) });

    if (!category) {
        return res.status(404).json({ error: "잘못된 접근입니다.", data: null });
    }

    return res.status(200).json({ error: null, data: { categoryName: category.categoryName, categoryNumber: category.categoryNumber } });
} catch (error) {
    return res.status(500).json({ error: "서버 오류입니다.", data: null });
}
});

module.exports = router;




