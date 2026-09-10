const router = require('express').Router();
const controller = require('./course.controller');
const { requireAuth, requireRole } = require('../auth/auth.middleware');
const { upload } = require('./course.upload');

router.get('/', controller.list);
router.get('/:id', controller.detail);
router.post('/', requireAuth, requireRole('admin'), controller.create);
router.patch('/:id', requireAuth, requireRole('admin'), controller.update);
router.delete('/:id', requireAuth, requireRole('admin'), controller.remove);
router.post('/:courseId/lectures', requireAuth, requireRole('admin'), upload.fields([{ name: 'video', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), controller.addLecture);
router.delete('/:courseId/lectures/:lectureId', requireAuth, requireRole('admin'), controller.removeLesson);

module.exports = router;
