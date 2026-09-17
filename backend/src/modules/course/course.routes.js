const router = require('express').Router();
const { thumbnailUpload } = require('../../utils/thumbnailUpload');
const controller = require('./course.controller');
const { requireAuth, requireRole, optionalAuth } = require('../auth/auth.middleware');
const { upload } = require('./course.upload');

router.get('/', optionalAuth, controller.list);
router.get('/admin', requireAuth, requireRole('admin'), controller.adminList);
router.get('/admin/:id', requireAuth, requireRole('admin'), controller.adminDetail);
router.get('/:id', optionalAuth, controller.detail);
router.post('/:id/checkout', requireAuth, requireRole('student'), controller.checkout);
router.post('/:id/checkout/verify', requireAuth, requireRole('student'), controller.verifyPayment);
router.delete('/:id/thumbnail', requireAuth, requireRole('admin'), controller.removeThumbnail);
router.post('/:id/thumbnail', requireAuth, requireRole('admin'), thumbnailUpload, controller.uploadThumbnail);
router.post('/', requireAuth, requireRole('admin'), controller.create);
router.patch('/:id', requireAuth, requireRole('admin'), controller.update);
router.delete('/:id', requireAuth, requireRole('admin'), controller.remove);
router.post('/:courseId/lectures', requireAuth, requireRole('admin'), upload.any(), controller.addLecture);
router.delete('/:courseId/lectures/:lectureId', requireAuth, requireRole('admin'), controller.removeLesson);

module.exports = router;
