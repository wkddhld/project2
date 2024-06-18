const { User } = require('../data');
const bcrypt = require('bcrypt');

const checkPasswordMiddleware = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: res.locals.user.email }).lean();

        // 사용자가 없는 경우
        if (!user) {
            const err = new Error('사용자를 찾을 수 없습니다.');
            err.statusCode = 401;
            throw err;
        }

        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);

        // 비밀번호가 일치하지 않는 경우
        if (!isPasswordCorrect) {
            const err = new Error('비밀번호가 일치하지 않습니다. 비밀번호를 다시 입력해주세요.');
            err.statusCode = 401;
            throw err;
        }

        // 비밀번호가 일치하는 경우
        res.locals.body = true;
        res.json('비밀번호 재확인 완료');
    } catch (err) {
        next(err);
    }
};

module.exports = checkPasswordMiddleware;