const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function ensureConfigured() {
  const keys = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length) throw new Error('Cloudinary is not configured. Missing: ' + missing.join(', '));
}

function uploadBuffer(buffer, options = {}) {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const settings = { folder: 'testbook/courses', ...options };
    const done = (error, result) => {
      if (error) {
        error.statusCode = error.http_code || error.statusCode || 502;
        return reject(error);
      }
      return resolve(result);
    };
    const stream = settings.resource_type === 'video'
      ? cloudinary.uploader.upload_chunked_stream({ chunk_size: 20 * 1024 * 1024, ...settings }, done)
      : cloudinary.uploader.upload_stream(settings, done);
    stream.end(buffer);
  });
}

async function destroy(publicId, resourceType = 'video') {
  ensureConfigured();
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

module.exports = { uploadBuffer, destroy };
