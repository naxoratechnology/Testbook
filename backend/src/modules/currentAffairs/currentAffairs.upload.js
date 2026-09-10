const multer = require('multer');
const { uploadBuffer } = require('../../config/cloudinary');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 }, fileFilter: (_r, f, cb) => cb(f.mimetype === 'application/pdf' ? null : new Error('Only PDF files are allowed.')) });
async function uploadPdf(file, id) { if (!file) throw Object.assign(new Error('PDF file is required.'), { statusCode: 400 }); const result = await uploadBuffer(file.buffer, { folder: 'testbook/current-affairs', public_id: id + '-' + Date.now(), resource_type: 'raw' }); return { pdfUrl: result.secure_url, pdfPublicId: result.public_id }; }
module.exports = { upload, uploadPdf };
