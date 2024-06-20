const express = require('express');

const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User } = require('../data');

router.post('/', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: res.locals.user.email }).lean();

    // 사용자가 없는 경우
    if (user === null || user === undefined) {
      const err = new Error('사용자를 찾을 수 없습니다.');
      err.statusCode = 401;
      throw err;
    }

    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
    // 비밀번호가 일치하지 않는 경우
    if (isPasswordCorrect === false) {
      const err = new Error('비밀번호가 일치하지 않습니다. 비밀번호를 다시 입력해주세요.');
      err.statusCode = 401;
      throw err;
    }

    // 비밀번호 재확인 절차를 위한 임시 토큰 발급
    const token = jwt.sign({ confirm: true }, process.env.CONFIRM_JWT_SECRET_KEY, {
      expiresIn: '5m',
    });

    // 비밀번호가 일치하는 경우
    res.cookie('tempCookies', token, { httpOnly: true }).json({
      err: null,
      data: { message: '비밀번호 재확인 완료되었습니다.' },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
