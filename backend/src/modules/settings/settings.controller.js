const service = require('./settings.service'); const validation = require('./settings.validation');
async function get(req, res, next) { try { return res.json({ success: true, data: { settings: await service.get() } }); } catch (error) { return next(error); } }
async function update(req, res, next) { try { const { value, errors } = validation.validate(req.body); if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Validation failed.', errors }); return res.json({ success: true, data: { settings: await service.update(value) } }); } catch (error) { return next(error); } }
module.exports = { get, update };
