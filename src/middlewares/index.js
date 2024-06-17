const isAuthenticatedAdminMiddleware = require('./isAuthenticatedAdmin');
const isAuthenticatedMiddleware = require('./isAuthenticated');
const checkPassword = require('./checkPassword');

module.exports = {  isAuthenticatedAdminMiddleware, isAuthenticatedMiddleware, checkPassword };

