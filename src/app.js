const router = require('express').Router();
const { signupRouter, signinRouter } = require('./routes');

router.get('/', (req, res) => {
    res.json('홈페이지입니다.');
});
router.use('/sign-up', signupRouter);
router.use('/sign-in', signinRouter);
module.exports = router;
