const service = require('./settings.service'); const validation = require('./settings.validation');
async function get(req, res, next) { try { return res.json({ success: true, data: { settings: await service.get() } }); } catch (error) { return next(error); } }
async function update(req, res, next) { try { const { value, errors } = validation.validate(req.body); if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Validation failed.', errors }); return res.json({ success: true, data: { settings: await service.update(value) } }); } catch (error) { return next(error); } }
async function uploadFounderPhoto(req, res, next) { try { const settings = await service.get(); const result = await require('../../utils/thumbnailUpload').saveThumbnail(require('./settings.model'), settings._id, req.file, 'founder'); return res.json({ success: true, data: { settings: result.toObject() } }); } catch (error) { return next(error); } }
async function removeFounderPhoto(req, res, next) { try { const settings = await service.get(); const result = await require('../../utils/thumbnailUpload').removeThumbnail(require('./settings.model'), settings._id); return res.json({ success: true, data: { settings: result.toObject() } }); } catch (error) { return next(error); } }
async function about(req, res, next) {
  try {
    const settings = await service.get();
    const fields = ['aboutTitle', 'aboutDescription', 'contactEmail', 'contactPhone', 'contactAddress', 'founderName', 'founderPhone', 'founderEmail', 'instagramUrl', 'whatsappUrl', 'telegramUrl', 'youtubeUrl'];
    const content = Object.fromEntries(fields.map(field => [field, settings[field] || '']));
    content.founderPhoto = settings.thumbnail || '';
    return res.json({ success: true, data: { content } });
  } catch (error) { return next(error); }
}
module.exports = { get, update, uploadFounderPhoto, removeFounderPhoto, about };
