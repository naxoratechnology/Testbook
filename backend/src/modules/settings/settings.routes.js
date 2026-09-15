const router = require('express').Router(); const controller = require('./settings.controller'); const { requireAuth, requireRole } = require('../auth/auth.middleware');
router.use(requireAuth, requireRole('admin')); router.get('/', controller.get); router.patch('/', controller.update); module.exports = router;
