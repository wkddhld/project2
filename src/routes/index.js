const apiRouter = require('express').Router();
const authRouter = require('./authRouter');
const adminCategoryRouter = require('./adminCategoryRouter');
const categoryRouter = require('./categoryRouter');
const userCrudRouter = require('./userCrudRouter');
const categoriesWithSubCategoriesRouter = require('./categoriesWithSubCategoriesRouter');
const subCategoryRouter = require('./subCategoryRouter');
const adminSubCategoryRouter = require('./adminSubCategoryRouter');
const productRouter = require('./productRouter');
const detailProductRouter = require('./detailProductRouter');
const checkOrderRouter = require('./checkOrderRouter');
const { isAuthenticatedMiddleware, isAuthenticatedAdminMiddleware } = require('../middlewares');

apiRouter.use('/', authRouter); // 회원가입 및 로그인 라우터 연결
apiRouter.use('/categories', categoryRouter); // 카테고리 조회 및 카테고리별 상품 조회하는 라우터 연결
apiRouter.use('/categories', categoriesWithSubCategoriesRouter); //대분류와 소분류 모두 조회 라우터연결
apiRouter.use('/admin/categories', isAuthenticatedAdminMiddleware, adminCategoryRouter); // 카테고리 수정 & 삭제 & 추가 라우터 연결
apiRouter.use('/my-page', isAuthenticatedMiddleware, userCrudRouter); // 회원 정보 조회 & 수정 & 삭제 라우터 연결
apiRouter.use('/categories', subCategoryRouter); //소분류카테고리 조회 라우터
apiRouter.use('/admin/subcategories', isAuthenticatedAdminMiddleware, adminSubCategoryRouter); // 소분류 카테고리 수정 & 삭제 & 추가 라우터 연결
apiRouter.use('/admin/products', productRouter);
apiRouter.use('/products', detailProductRouter);
apiRouter.use('/orders', checkOrderRouter);

module.exports = apiRouter;
