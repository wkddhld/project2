const apiRouter = require('express').Router();
const authRouter = require('./authRouter');
const adminCategoryRouter = require('./adminCategoryRouter');
const categoryRouter = require('./categoryRouter');
const userCrudRouter = require('./userCrudRouter');

apiRouter.use('/', authRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/admin/categories', adminCategoryRouter);
apiRouter.use('/my-page', userCrudRouter);

module.exports = apiRouter;
