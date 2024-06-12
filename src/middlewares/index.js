const cookiesMiddleware = require('./cookiesMiddleware');
const isAuthenticatedAdminMiddleware = require('./isAuthenticatedAdmin');
const isAuthenticatedMiddleware = require('./isAuthenticated');

module.exports = { cookiesMiddleware, isAuthenticatedAdminMiddleware, isAuthenticatedMiddleware };
