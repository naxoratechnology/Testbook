const Banner = require('./banner.model');
const { destroy } = require('../../config/cloudinary');
async function list(admin = false, placement) { const filter = admin ? {} : { thumbnail: { $ne: '' } }; if (placement) filter.placement = { $in: [placement, 'both'] }; return Banner.find(filter).sort({ order: 1, createdAt: -1 }).lean(); }
async function create(data, userId) { return Banner.create({ ...data, createdBy: userId }); }
async function update(id, data) { const item = await Banner.findByIdAndUpdate(id, data, { new: true, runValidators: true }); if (!item) throw Object.assign(new Error('Banner not found.'), { statusCode: 404 }); return item; }
async function remove(id) { const item = await Banner.findById(id).select('+thumbnailPublicId'); if (!item) throw Object.assign(new Error('Banner not found.'), { statusCode: 404 }); if (item.thumbnailPublicId) await destroy(item.thumbnailPublicId, 'image'); await item.deleteOne(); }
module.exports = { list, create, update, remove };
