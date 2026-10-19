const service = require('./notesCollection.service');
const Collection = require('./notesCollection.model');
const { saveThumbnail, removeThumbnail } = require('../../utils/thumbnailUpload');
const run = (handler) => (req, res, next) => Promise.resolve(handler(req, res)).catch(next);
module.exports = {
  list: run(async (req, res) => res.json({ success: true, data: { collections: await service.list(req.auth?.role === 'admin') } })),
  adminList: run(async (_req, res) => res.json({ success: true, data: { collections: await service.list(true) } })),
  detail: run(async (req, res) => res.json({ success: true, data: { collection: await service.find(req.params.id, req.auth?.role === 'admin') } })),
  create: run(async (req, res) => res.status(201).json({ success: true, data: { collection: await service.create(req.body, req.auth.sub) } })),
  update: run(async (req, res) => res.json({ success: true, data: { collection: await service.update(req.params.id, req.body) } })),
  remove: run(async (req, res) => { await service.remove(req.params.id); res.json({ success: true }); }),
  uploadThumbnail: run(async (req, res) => res.json({ success: true, data: { collection: await saveThumbnail(Collection, req.params.id, req.file, 'notes') } })),
  removeThumbnail: run(async (req, res) => res.json({ success: true, data: { collection: await removeThumbnail(Collection, req.params.id) } })),
};
