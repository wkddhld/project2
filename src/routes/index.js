const apiRouter = require('express').Router();
const authRouter = require('./authRouter');
const adminCategoryRouter = require('./adminCategoryRouter');
const categoryRouter = require('./categoryRouter');
const userCrudRouter = require('./userCrudRouter');
const { cookiesMiddleware, isAuthenticatedMiddleware, isAuthenticatedAdminMiddleware } = require('../middlewares');

apiRouter.use('/', cookiesMiddleware, authRouter); // 회원가입 및 로그인 라우터 연결
apiRouter.use('/categories', cookiesMiddleware, categoryRouter); // 카테고리 조회 및 카테고리별 상품 조회하는 라우터 연결
apiRouter.use('/admin/categories', cookiesMiddleware, isAuthenticatedAdminMiddleware, adminCategoryRouter); // 카테고리 수정 & 삭제 & 추가 라우터 연결
apiRouter.use('/my-page', cookiesMiddleware, isAuthenticatedMiddleware, userCrudRouter); // 회원 정보 조회 & 수정 & 삭제 라우터 연결

module.exports = apiRouter;