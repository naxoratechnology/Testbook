const service = require('./currentAffairs.service');
const validation = require('./currentAffairs.validation');
const run = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
const create = run(async (req, res) => { const { value, errors } = validation.validate(req.body); if (Object.keys(errors).length || !req.file) return res.status(400).json({ success: false, message: 'Validation failed.', errors }); return res.status(201).json({ success: true, data: { currentAffairs: await service.create(value, req.file, req.auth.sub) } }); });
const list = run(async (req, res) => res.json({ success: true, data: { currentAffairs: await service.list(req.auth?.role === 'admin') } }));
const detail = run(async (req, res) => res.json({ success: true, data: { currentAffairs: await service.find(req.params.id, req.auth?.role === 'admin') } }));
const update = run(async (req, res) => res.json({ success: true, data: { currentAffairs: await service.update(req.params.id, validation.validate(req.body).value) } }));
const remove = run(async (req, res) => { await service.remove(req.params.id); return res.json({ success: true, message: 'Current affairs entry deleted.' }); });
module.exports = { create, list, detail, update, remove };
