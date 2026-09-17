const router = require('express').Router();
const controller = require('./bookmark.controller');
const { requireAuth } = require('../auth/auth.middleware');
router.use(requireAuth);
router.get('/', controller.list);
router.post('/', controller.save);
router.delete('/:id', controller.remove);
module.exports = router;
