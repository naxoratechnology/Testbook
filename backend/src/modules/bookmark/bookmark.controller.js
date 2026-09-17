const service = require('./bookmark.service');
const run = (handler) => (req, res, next) => Promise.resolve(handler(req, res)).catch(next);
const list = run(async (req, res) => res.json({ success: true, data: { bookmarks: await service.list(req.auth.sub) } }));
const save = run(async (req, res) => res.status(201).json({ success: true, data: { bookmark: await service.save(req.auth.sub, req.body, req.auth.role) } }));
const remove = run(async (req, res) => { await service.remove(req.auth.sub, req.params.id); res.json({ success: true, message: 'Question removed from saved questions.' }); });
module.exports = { list, save, remove };
