const router = require('express').Router();
const multer = require('multer');
const { randomUUID } = require('crypto');
const { requireAuth, requireRole } = require('../auth/auth.middleware');
const { uploadBuffer } = require('../../config/cloudinary');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_request, file, callback) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    callback(allowed.includes(file.mimetype) ? null : Object.assign(new Error('Upload a JPG, PNG or WebP image.'), { statusCode: 400 }), allowed.includes(file.mimetype));
  },
});

router.post('/', requireAuth, requireRole('admin'), (request, response, next) => {
  upload.single('upload')(request, response, async (error) => {
    if (error) return response.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ success: false, message: error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller.' : error.message });
    try {
      if (!request.file) throw Object.assign(new Error('Choose an image to upload.'), { statusCode: 400 });
      const data = request.file.buffer;
      const isImage = (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff)
        || data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        || (data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP');
      if (!isImage) throw Object.assign(new Error('The uploaded file is not a valid image.'), { statusCode: 400 });
      const result = await uploadBuffer(data, { folder: 'testbook/question-content', public_id: randomUUID(), resource_type: 'image' });
      return response.status(201).json({ success: true, data: { url: result.secure_url } });
    } catch (uploadError) { return next(uploadError); }
  });
});

module.exports = router;
