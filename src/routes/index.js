const apiRouter = require('express').Router();

const authRouter = require('./authRouter');
const adminCategoryRouter = require('./adminCategoryRouter');
const categoryRouter = require('./categoryRouter');
const userCrudRouter = require('./userCrudRouter');
const adminSubCategoryRouter = require('./adminSubCategoryRouter');
const adminProductRouter = require('./adminProductRouter');
const userProductRouter = require('./userProductRouter');
const userOrderRouter = require('./userOrderRouter');
const userDetailProductRouter = require('./userDetailProductRouter');
const adminOrderRouter = require('./adminOrderRouter');
const userInfoRouter = require('./userInfoRouter');
const checkPasswordRouter = require('./checkPasswordRouter');
const { isAuthenticatedMiddleware, isAuthenticatedAdminMiddleware } = require('../middlewares');

apiRouter.use('/', authRouter); // 회원가입 및 로그인 라우터 연결
apiRouter.use('/categories', categoryRouter); // 카테고리 조회 및 카테고리별 상품 조회하는 라우터 연결
apiRouter.use('/admin/categories', isAuthenticatedAdminMiddleware, adminCategoryRouter); // 카테고리 수정 & 삭제 & 추가 라우터 연결
apiRouter.use('/checkPassword', isAuthenticatedMiddleware, checkPasswordRouter); // 회원 정보 조회 & 수정 & 삭제 라우터 연결
apiRouter.use('/my-page', isAuthenticatedMiddleware, userCrudRouter);
apiRouter.use('/admin/subcategories', isAuthenticatedAdminMiddleware, adminSubCategoryRouter); // 소분류 카테고리 수정 & 삭제 & 추가 라우터 연결
apiRouter.use('/admin/products', isAuthenticatedAdminMiddleware, adminProductRouter);
apiRouter.use('/admin/orders', isAuthenticatedAdminMiddleware, adminOrderRouter);
apiRouter.use('/products', userProductRouter);
apiRouter.use('/orders', userOrderRouter);
apiRouter.use('/product', userDetailProductRouter);
apiRouter.use('/info', isAuthenticatedMiddleware, userInfoRouter);

module.exports = apiRouter;
