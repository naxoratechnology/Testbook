const service = require('./previousPaper.service');
const validation = require('./previousPaper.validation');
const run = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
const create = run(async (req, res) => { const { value, errors } = validation.validate(req.body); if (!req.file && !value.questions.length) errors.file = 'Upload a PDF or add an online test.'; if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Validation failed.', errors }); return res.status(201).json({ success: true, data: { paper: await service.create(value, req.file, req.auth.sub) } }); });
const list = run(async (req, res) => res.json({ success: true, data: { papers: await service.list(req.auth?.role === 'admin', req.query, req.auth?.sub, req.auth?.role) } }));
const adminList = run(async (req, res) => res.json({ success: true, data: { papers: await service.list(true, req.query) } }));
const detail = run(async (req, res) => res.json({ success: true, data: { paper: await service.find(req.params.id, req.auth?.role === 'admin', req.auth?.sub, req.auth?.role) } }));
const adminDetail = run(async (req, res) => res.json({ success: true, data: { paper: await service.find(req.params.id, true) } }));
const update = run(async (req, res) => { const { value, errors } = validation.validate(req.body); if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Validation failed.', errors }); return res.json({ success: true, data: { paper: await service.update(req.params.id, value, req.file) } }); });
const remove = run(async (req, res) => { await service.remove(req.params.id); return res.json({ success: true, message: 'Previous paper deleted successfully.' }); });
const attempt = run(async (req, res) => res.status(201).json({ success: true, data: { result: await service.attempt(req.params.id, req.auth.sub, req.body.answers || {}) } }));
module.exports = { create, list, adminList, detail, adminDetail, update, remove, attempt };

const payment = require('./previousPaper.payment.service');
module.exports.catalog = run(async (req, res) => res.json({ success: true, data: { directories: await service.directories(req.auth?.role === 'admin'), price: await payment.getPrice(), purchased: await payment.hasAccess(req.auth?.sub, req.auth?.role) } }));
module.exports.updatePrice = run(async (req, res) => res.json({ success: true, data: await payment.updatePrice(req.body.price, req.body.access) }));
module.exports.createDirectory = run(async (req, res) => res.status(201).json({ success: true, data: { directory: await service.createDirectory(req.body) } }));
module.exports.checkout = run(async (req, res) => res.json({ success: true, data: await payment.checkout(req.auth.sub) }));
module.exports.verifyPayment = run(async (req, res) => res.json({ success: true, data: { purchase: await payment.verify(req.auth.sub, req.body) } }));
