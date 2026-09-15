const service = require('./dashboard.service');
const Settings = require('../settings/settings.model');
const run = (handler) => (req, res, next) => Promise.resolve(handler(req, res)).catch(next);
const home = run(async (_req, res) => { const summary = await service.home(); const settings = await Settings.findOne({ key: 'platform' }).lean(); return res.json({ success: true, data: { ...summary, content: { aboutTitle: settings?.aboutTitle || 'About Chandrabhaga Academy', aboutDescription: settings?.aboutDescription || 'A focused learning platform for competitive exam preparation.', contactEmail: settings?.contactEmail || settings?.supportEmail || 'support@chandrabhagaacademy.com', contactPhone: settings?.contactPhone || '', contactAddress: settings?.contactAddress || '' } } }); });
const student = run(async (req, res) => res.json({ success: true, data: await service.student(req.auth.sub) }));
const admin = run(async (_req, res) => res.json({ success: true, data: await service.admin() }));
module.exports = { home, student, admin };
