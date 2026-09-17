const multer = require('multer');
const { randomUUID } = require('crypto');
const { uploadBuffer, destroy } = require('../config/cloudinary');

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    callback(allowed.includes(file.mimetype) ? null : Object.assign(new Error('Upload a JPG, PNG or WebP image.'), { statusCode: 400 }), allowed.includes(file.mimetype));
  },
});

async function saveThumbnail(Model, id, file, folder) {
  if (!file) throw Object.assign(new Error('A thumbnail image is required.'), { statusCode: 400 });
  const item = await Model.findById(id).select('+thumbnailPublicId');
  if (!item) throw Object.assign(new Error('Content not found.'), { statusCode: 404 });
  const data = file.buffer;
  const isImage = (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) || data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) || (data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP');
  if (!isImage) throw Object.assign(new Error('The uploaded file is not a valid image.'), { statusCode: 400 });
  const result = await uploadBuffer(data, { folder: `testbook/${folder}/thumbnails`, public_id: `${id}-${randomUUID()}`, resource_type: 'image' });
  const oldPublicId = item.thumbnailPublicId;
  item.thumbnail = result.secure_url;
  item.thumbnailPublicId = result.public_id;
  try { await item.save(); } catch (error) { await destroy(result.public_id, 'image').catch(() => undefined); throw error; }
  if (oldPublicId) await destroy(oldPublicId, 'image').catch((error) => console.warn('Previous thumbnail cleanup failed:', error.message));
  return item;
}

function thumbnailUpload(req, res, next) {
  imageUpload.single('thumbnail')(req, res, (error) => {
    if (!error) return next();
    return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ success: false, message: error.code === 'LIMIT_FILE_SIZE' ? 'Thumbnail image must be 5 MB or smaller.' : error.message });
  });
}

async function removeThumbnail(Model, id) {
  const item = await Model.findById(id).select('+thumbnailPublicId');
  if (!item) throw Object.assign(new Error('Content not found.'), { statusCode: 404 });
  if (item.thumbnailPublicId) await destroy(item.thumbnailPublicId, 'image');
  item.thumbnail = '';
  item.thumbnailPublicId = '';
  await item.save();
  return item;
}

module.exports = { thumbnailUpload, saveThumbnail, removeThumbnail };
