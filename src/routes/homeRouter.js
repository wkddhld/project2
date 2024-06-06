const router = require('express').Router();
const { Category } = require('../data');

router.get('/', async (req, res, next) => {
    const categories = await Category.find({});
    res.send(categories);
});
module.exports = router;
