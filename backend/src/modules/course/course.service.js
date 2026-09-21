const Course = require('./course.model');
const Enrollment = require('./course.enrollment.model');
const { uploadLesson } = require('./course.upload');
const { destroy } = require('../../config/cloudinary');
const notifications = require('../notification/notification.service');
const { youtubeEmbedUrl } = require('./course.youtube');
const defaultThumbnail = '/course-placeholder.svg';

function publicCourse(course, unlocked = false) {
  return { ...course, thumbnail: course.thumbnail || defaultThumbnail, lectures: (course.lectures || []).map((lecture) => {
    const { publicId, pdfPublicId, pdfResourceType, resourceType, ...safe } = lecture;
    if (course.access === 'paid' && !unlocked && !lecture.isPreview) return { ...safe, url: '', pdfUrl: '' };
    return safe;
  }), enrolled: unlocked };
}

async function create(data, userId) {
  const course = await Course.create({ ...data, createdBy: userId, publishedAt: data.status === 'published' ? new Date() : null });
  if (course.status === 'published') await notifications.publish({ title: 'New course available', message: course.title, type: 'course', href: `/courses/${course._id}`, userId });
  return course;
}
async function list(query = {}, admin = false, userId = null) {
  const filter = admin ? {} : { status: 'published' };
  if (query.exam) filter.exam = query.exam;
  if (query.category) filter.category = query.category;
  if (query.access) filter.access = query.access;
  if (query.search) filter.$text = { $search: query.search };
  const courses = await Course.find(filter).sort({ createdAt: -1 }).lean();
  if (admin) return courses;
  const enrolledIds = userId ? await Enrollment.find({ user: userId, status: 'active' }).distinct('course') : [];
  const access = new Set(enrolledIds.map(String));
  return courses.map((course) => publicCourse(course, course.access === 'free' || access.has(String(course._id))));
}
async function findById(id, admin = false, userId = null) {
  const filter = admin ? { _id: id } : { _id: id, status: 'published' };
  const course = await Course.findOne(filter).lean();
  if (!course) throw Object.assign(new Error('Course not found.'), { statusCode: 404 });
  if (admin) return course;
  const enrolled = course.access === 'free' || Boolean(userId && await Enrollment.exists({ user: userId, course: id, status: 'active' }));
  return publicCourse(course, enrolled);
}
async function update(id, data) {
  const course = await Course.findByIdAndUpdate(id, { ...data, publishedAt: data.status === 'published' ? new Date() : null }, { new: true, runValidators: true });
  if (!course) throw Object.assign(new Error('Course not found.'), { statusCode: 404 });
  return course;
}
async function remove(id) {
  const result = await Course.findById(id).select('+thumbnailPublicId');
  if (!result) throw Object.assign(new Error('Course not found.'), { statusCode: 404 });
  for (const lecture of result.lectures) {
    if (lecture.publicId) await destroy(lecture.publicId, lecture.resourceType);
    if (lecture.pdfPublicId) await destroy(lecture.pdfPublicId, lecture.pdfResourceType || 'raw');
  }
  if (result.thumbnailPublicId) await destroy(result.thumbnailPublicId, 'image');
  await result.deleteOne();
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
  const youtubeUrl = String(data.youtubeUrl || '').trim();
  if (Boolean(video) === Boolean(youtubeUrl)) throw Object.assign(new Error('Provide either one uploaded video or a YouTube URL, not both.'), { statusCode: 400 });
  if (!String(data.title || '').trim()) throw Object.assign(new Error('Lecture name is required.'), { statusCode: 400 });
  const subject = String(data.subject || '').trim();
  if (subject && !(course.subjects || []).includes(subject)) throw Object.assign(new Error('Select a subject belonging to this course.'), { statusCode: 400 });
  if (data.isPreview === 'true' && course.lectures.filter((lecture) => lecture.isPreview).length >= 2) throw Object.assign(new Error('Choose no more than two free demo lectures.'), { statusCode: 400 });
  const media = youtubeUrl ? { url: youtubeEmbedUrl(youtubeUrl), publicId: '', resourceType: 'youtube', duration: '' } : await uploadLesson(video, 'video', courseId, 'lectures');
  let notes = {};
  if (pdf) notes = await uploadLesson(pdf, 'pdf', courseId, 'lectures');
  course.lectures.push({ title: data.title, subject, description: data.description || '', kind: 'video', videoSource: youtubeUrl ? 'youtube' : 'upload', url: media.url, publicId: media.publicId, resourceType: media.resourceType, duration: data.duration || media.duration, isPreview: data.isPreview === 'true', pdfUrl: notes.url || '', pdfPublicId: notes.publicId || '', pdfResourceType: notes.resourceType || 'raw' });
  await course.save();
  return course;
}
async function removeLesson(courseId, _sectionId, lessonId) {
  const course = await Course.findById(courseId);
  if (!course) throw Object.assign(new Error('Course not found.'), { statusCode: 404 });
  const lesson = course.lectures.id(lessonId);
  if (!lesson) throw Object.assign(new Error('Lesson not found.'), { statusCode: 404 });
  if (lesson.publicId) await destroy(lesson.publicId, lesson.resourceType);
  if (lesson.pdfPublicId) await destroy(lesson.pdfPublicId, lesson.pdfResourceType || 'raw');
  lesson.deleteOne();
  await course.save();
  return course;
}
module.exports = { create, list, findById, update, remove, addLesson, addLecture, removeLesson };
