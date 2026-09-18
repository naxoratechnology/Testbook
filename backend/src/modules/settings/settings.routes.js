const router = require('express').Router(); const controller = require('./settings.controller'); const { requireAuth, requireRole } = require('../auth/auth.middleware');
router.get('/about', controller.about);
router.use(requireAuth, requireRole('admin')); router.get('/', controller.get); router.patch('/', controller.update); router.post('/founder-photo', require('../../utils/thumbnailUpload').thumbnailUpload, controller.uploadFounderPhoto); router.delete('/founder-photo', controller.removeFounderPhoto); module.exports = router;
