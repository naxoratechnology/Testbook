const multer = require('multer');
const { uploadBuffer } = require('../../config/cloudinary');
const fileTypes = { 'application/pdf': 'pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx' };
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 }, fileFilter: (_r, file, cb) => fileTypes[file.mimetype] ? cb(null, true) : cb(new Error('Only PDF and Word (.docx) files are allowed.')) });
async function uploadPdf(file, id) { if (!file || !fileTypes[file.mimetype]) throw Object.assign(new Error('A PDF or Word (.docx) file is required.'), { statusCode: 400 }); const result = await uploadBuffer(file.buffer, { folder: 'testbook/notes', public_id: id + '-' + Date.now(), resource_type: 'raw' }); return { pdfUrl: result.secure_url, pdfPublicId: result.public_id, fileType: fileTypes[file.mimetype] }; }
module.exports = { upload, uploadPdf };
