const router = require('express').Router();
const controller = require('./auth.controller');
const { requireAuth } = require('./auth.middleware');
router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', requireAuth, controller.me);
router.post('/logout', controller.logout);
module.exports = router;
