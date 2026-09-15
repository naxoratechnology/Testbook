const multer = require('multer');
const { uploadBuffer } = require('../../config/cloudinary');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 1024, files: 2 },
  fileFilter: (_request, file, callback) => {
    const allowed = file.mimetype.startsWith('video/') || file.mimetype === 'application/pdf';
    if (!allowed) return callback(new Error('Only video files and PDF files are allowed.'));
    return callback(null, true);
  },
});

async function uploadLesson(file, kind, courseId, sectionId) {
  if (!file) throw Object.assign(new Error('A video or PDF file is required.'), { statusCode: 400 });
  const isVideo = kind === 'video' && file.mimetype.startsWith('video/');
  const isPdf = kind === 'pdf' && file.mimetype === 'application/pdf';
  if (!isVideo && !isPdf) throw Object.assign(new Error('File type does not match lesson kind.'), { statusCode: 400 });
  const result = await uploadBuffer(file.buffer, {
    public_id: courseId + '/' + sectionId + '/' + Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9-_]/g, '-'),
    resource_type: isVideo ? 'video' : 'raw',
  });
  return { url: result.secure_url, publicId: result.public_id, resourceType: isVideo ? 'video' : 'raw', duration: result.duration ? Math.round(result.duration) + 's' : '' };
}

module.exports = { upload, uploadLesson };
