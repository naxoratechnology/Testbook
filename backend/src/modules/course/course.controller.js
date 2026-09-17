const service = require('./course.service');
const { validateCourse } = require('./course.validation');
const payment = require('./course.payment.service');
const run = (handler) => (request, response, next) => Promise.resolve(handler(request, response)).catch(next);

const create = run(async (req, res) => {
  const { value, errors } = validateCourse(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Validation failed.', errors });
  return res.status(201).json({ success: true, data: { course: await service.create(value, req.auth.sub) } });
});
const list = run(async (req, res) => res.json({ success: true, data: { courses: await service.list(req.query, false, req.auth?.sub) } }));
const adminList = run(async (req, res) => res.json({ success: true, data: { courses: await service.list(req.query, true) } }));
const detail = run(async (req, res) => res.json({ success: true, data: { course: await service.findById(req.params.id, false, req.auth?.sub) } }));
const checkout = run(async (req, res) => res.json({ success: true, data: await payment.createOrder(req.auth.sub, req.params.id) }));
const verifyPayment = run(async (req, res) => res.json({ success: true, data: { enrollment: await payment.verify(req.auth.sub, req.params.id, req.body) } }));
const adminDetail = run(async (req, res) => res.json({ success: true, data: { course: await service.findById(req.params.id, true) } }));
const update = run(async (req, res) => {
  const { value, errors } = validateCourse(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Validation failed.', errors });
  return res.json({ success: true, data: { course: await service.update(req.params.id, value) } });
});
const remove = run(async (req, res) => { await service.remove(req.params.id); return res.json({ success: true, message: 'Course deleted successfully.' }); });
const addLesson = run(async (req, res) => {
  const course = await service.addLesson(req.params.courseId, req.params.sectionId, req.file, req.body);
  return res.status(201).json({ success: true, data: { course } });
});
const addLecture = run(async (req, res) => {
  const received = Array.isArray(req.files) ? req.files : [];
  const unexpected = received.find((file) => !['video', 'pdf'].includes(file.fieldname));
  if (unexpected) {
    return res.status(400).json({ success: false, message: `Unexpected upload field: ${unexpected.fieldname}.` });
  }
  const files = {
    video: received.filter((file) => file.fieldname === 'video').slice(0, 1),
    pdf: received.filter((file) => file.fieldname === 'pdf').slice(0, 1),
  };
  if (Boolean(files.video[0]) === Boolean(String(req.body.youtubeUrl || '').trim())) {
    return res.status(400).json({ success: false, message: 'Provide either one uploaded video or a YouTube URL, not both.' });
  }
  if (received.filter((file) => file.fieldname === 'video').length > 1 || received.filter((file) => file.fieldname === 'pdf').length > 1) {
    return res.status(400).json({ success: false, message: 'Upload only one video and one PDF per lecture.' });
  }
  const course = await service.addLecture(req.params.courseId, files, req.body);
  return res.status(201).json({ success: true, data: { course } });
});
const removeLesson = run(async (req, res) => {
  const course = await service.removeLesson(req.params.courseId, null, req.params.lectureId);
  return res.json({ success: true, data: { course } });
});
module.exports = { create, list, adminList, detail, adminDetail, update, remove, addLesson, addLecture, removeLesson, checkout, verifyPayment };

const { saveThumbnail, removeThumbnail } = require('../../utils/thumbnailUpload');
const ThumbnailModel = require('./course.model');
module.exports.uploadThumbnail = run(async (req, res) => res.json({ success: true, data: { course: await saveThumbnail(ThumbnailModel, req.params.id, req.file, 'courses') } }));

module.exports.removeThumbnail = run(async (req, res) => res.json({ success: true, data: { course: await removeThumbnail(ThumbnailModel, req.params.id) } }));
