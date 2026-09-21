const service = require('./dashboard.service');
const Settings = require('../settings/settings.model');
const banners = require('../banner/banner.service');
const run = (handler) => (req, res, next) => Promise.resolve(handler(req, res)).catch(next);
const home = run(async (_req, res) => {
  const [summary, settings, slides] = await Promise.all([service.home(), Settings.findOne({ key: 'platform' }).lean(), banners.list(false, 'home')]);
  return res.json({ success: true, data: { ...summary, banners: slides, content: { aboutTitle: settings?.aboutTitle || 'About Chandrabhaga Academy', aboutDescription: settings?.aboutDescription || 'A focused learning platform for competitive exam preparation.', contactEmail: settings?.contactEmail || settings?.supportEmail || 'support@chandrabhagaacademy.com', contactPhone: settings?.contactPhone || '', contactAddress: settings?.contactAddress || '', founderPhoto: settings?.thumbnail || '', founderName: settings?.founderName || '', founderPhone: settings?.founderPhone || '', founderEmail: settings?.founderEmail || '', instagramUrl: settings?.instagramUrl || '', whatsappUrl: settings?.whatsappUrl || '', telegramUrl: settings?.telegramUrl || '', youtubeUrl: settings?.youtubeUrl || '' } } });
});
const student = run(async (req, res) => res.json({ success: true, data: { ...(await service.student(req.auth.sub)), banners: await banners.list(false, 'dashboard') } }));
const admin = run(async (_req, res) => res.json({ success: true, data: await service.admin() }));
module.exports = { home, student, admin };
