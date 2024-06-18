const isAuthenticatedAdminMiddleware = require('./isAuthenticatedAdmin');
const isAuthenticatedMiddleware = require('./isAuthenticated');
const checkPasswordMiddleware = require('./checkPasswordMiddleware');
module.exports = { isAuthenticatedAdminMiddleware, isAuthenticatedMiddleware, checkPasswordMiddleware };
