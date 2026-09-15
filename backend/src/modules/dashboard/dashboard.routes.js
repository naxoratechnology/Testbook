const router = require('express').Router();
const controller = require('./dashboard.controller');
const { requireAuth, requireRole } = require('../auth/auth.middleware');
router.get('/home', controller.home);
router.get('/student', requireAuth, requireRole('student'), controller.student);
router.get('/admin', requireAuth, requireRole('admin'), controller.admin);
module.exports = router;
