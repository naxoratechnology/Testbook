const multer = require('multer');

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const identityDocumentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, done) => allowed.has(file.mimetype)
    ? done(null, true)
    : done(Object.assign(new Error('Upload a JPG, PNG, WebP, or PDF identity document.'), { statusCode: 400 })),
});

module.exports = { identityDocumentUpload };
