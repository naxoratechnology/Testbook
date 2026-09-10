const service = require('./course.service');
const { validateCourse } = require('./course.validation');
const run = (handler) => (request, response, next) => Promise.resolve(handler(request, response)).catch(next);

const create = run(async (req, res) => {
  const { value, errors } = validateCourse(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Validation failed.', errors });
  return res.status(201).json({ success: true, data: { course: await service.create(value, req.auth.sub) } });
});
const list = run(async (req, res) => res.json({ success: true, data: { courses: await service.list(req.query, Boolean(req.auth)) } }));
const detail = run(async (req, res) => res.json({ success: true, data: { course: await service.findById(req.params.id, Boolean(req.auth)) } }));
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
  const course = await service.addLecture(req.params.courseId, req.files, req.body);
  return res.status(201).json({ success: true, data: { course } });
});
const removeLesson = run(async (req, res) => {
  const course = await service.removeLesson(req.params.courseId, null, req.params.lectureId);
  return res.json({ success: true, data: { course } });
});
module.exports = { create, list, detail, update, remove, addLesson, addLecture, removeLesson };
