const router = require('express').Router();

const { signupRouter, signinRouter,categoryRouter,adminCategoryRouter } = require('./routes');



router.get('/', (req, res) => {
    res.json('홈페이지입니다.');
});


router.use('/sign-up', signupRouter);
router.use('/sign-in', signinRouter);
router.use('/categories',categoryRouter);
router.use('/admin/categories',adminCategoryRouter);


module.exports = router;

