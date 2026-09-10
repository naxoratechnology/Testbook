const Course = require('./course.model');
const { uploadLesson } = require('./course.upload');
const { destroy } = require('../../config/cloudinary');

async function create(data, userId) {
  const course = await Course.create({ ...data, createdBy: userId, publishedAt: data.status === 'published' ? new Date() : null });
  return course;
}
async function list(query = {}, admin = false) {
  const filter = admin ? {} : { status: 'published' };
  if (query.exam) filter.exam = query.exam;
  if (query.category) filter.category = query.category;
  if (query.access) filter.access = query.access;
  if (query.search) filter.$text = { $search: query.search };
  return Course.find(filter).sort({ createdAt: -1 }).lean();
}
async function findById(id, admin = false) {
  const filter = admin ? { _id: id } : { _id: id, status: 'published' };
  const course = await Course.findOne(filter).lean();
  if (!course) throw Object.assign(new Error('Course not found.'), { statusCode: 404 });
  return course;
}
async function update(id, data) {
  const course = await Course.findByIdAndUpdate(id, { ...data, publishedAt: data.status === 'published' ? new Date() : null }, { new: true, runValidators: true });
  if (!course) throw Object.assign(new Error('Course not found.'), { statusCode: 404 });
  return course;
}
async function remove(id) {
  const result = await Course.findByIdAndDelete(id);
  if (!result) throw Object.assign(new Error('Course not found.'), { statusCode: 404 });
}
async function addLesson(courseId, sectionId, file, data) {
  const course = await Course.findById(courseId);
  if (!course) throw Object.assign(new Error('Course not found.'), { statusCode: 404 });
  const section = course.sections.id(sectionId);
  if (!section) throw Object.assign(new Error('Course section not found.'), { statusCode: 404 });
  const media = await uploadLesson(file, data.kind, courseId, sectionId);
  section.lessons.push({ title: data.title, description: data.description || '', kind: data.kind, url: media.url, publicId: media.publicId, resourceType: media.resourceType, duration: data.duration || media.duration, isPreview: data.isPreview === 'true' });
  await course.save();
  return course;
}
async function addLecture(courseId, files, data) {
  const course = await Course.findById(courseId);
  if (!course) throw Object.assign(new Error('Course not found.'), { statusCode: 404 });
  const video = files.video && files.video[0];
  const pdf = files.pdf && files.pdf[0];
  if (!video) throw Object.assign(new Error('A lecture video is required.'), { statusCode: 400 });
  const media = await uploadLesson(video, 'video', courseId, 'lectures');
  let notes = {};
  if (pdf) notes = await uploadLesson(pdf, 'pdf', courseId, 'lectures');
  course.lectures.push({ title: data.title, description: data.description || '', kind: 'video', url: media.url, publicId: media.publicId, resourceType: media.resourceType, duration: data.duration || media.duration, isPreview: data.isPreview === 'true', pdfUrl: notes.url || '', pdfPublicId: notes.publicId || '', pdfResourceType: notes.resourceType || 'raw' });
  await course.save();
  return course;
}
async function removeLesson(courseId, _sectionId, lessonId) {
  const course = await Course.findById(courseId);
  if (!course) throw Object.assign(new Error('Course not found.'), { statusCode: 404 });
  const lesson = course.lectures.id(lessonId);
  if (!lesson) throw Object.assign(new Error('Lesson not found.'), { statusCode: 404 });
  await destroy(lesson.publicId, lesson.resourceType);
  lesson.deleteOne();
  await course.save();
  return course;
}
module.exports = { create, list, findById, update, remove, addLesson, addLecture, removeLesson };
