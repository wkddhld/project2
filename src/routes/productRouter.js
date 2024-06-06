const router = require('express').Router();
const { Product } = require('../data');

router.get('/:productNum', async (req, res, next) => {
    try {
        const { productNum } = req.params;
        const product = await Product.findOne({ productNum: Number(productNum) });
        if (!product) {
            const err = new Error('존재하지 않는 상품입니다.');
            err.statusCode = 409;
            throw err;
        }
        res.status(200).json(product);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
