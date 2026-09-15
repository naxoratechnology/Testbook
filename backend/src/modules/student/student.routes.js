const express = require('express');
const controller = require('./student.controller');
const { requireAuth, requireRole } = require('../auth/auth.middleware');

const router = express.Router();
router.use(requireAuth, requireRole('admin'));
router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.patch('/:id/status', controller.status);
router.delete('/:id', controller.remove);

module.exports = router;
