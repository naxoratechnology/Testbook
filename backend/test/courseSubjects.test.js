const test = require('node:test');
const assert = require('node:assert/strict');
const Course = require('../src/modules/course/course.model');
const upload = require('../src/modules/course/course.upload');
let uploaded = 0;
upload.uploadLesson = async () => { uploaded++; return { url: 'video.url', publicId: 'video', resourceType: 'video' }; };
const service = require('../src/modules/course/course.service');
const { validateCourse } = require('../src/modules/course/course.validation');
const details = { title: 'Course', description: 'Details', exam: 'SSC', category: 'SSC', instructor: 'Teacher', access: 'free' };
test('subjects are optional and legacy payloads do not overwrite existing subject definitions', () => {
  const legacy = validateCourse(details); assert.deepEqual(legacy.errors, {}); assert.equal(legacy.value.subjects, undefined);
  const grouped = validateCourse({ ...details, subjects: [' Mathematics ', 'English'] }); assert.deepEqual(grouped.value.subjects, ['Mathematics', 'English']); assert.deepEqual(grouped.errors, {});
});
test('subject validation rejects duplicate, blank and invalid lecture assignments', () => {
  for (const subjects of [['English', 'english'], [''], ['x'.repeat(121)], 'English']) assert.ok(validateCourse({ ...details, subjects }).errors.subjects);
  assert.ok(validateCourse({ ...details, subjects: ['English'], lectures: [{ subject: 'History' }] }).errors.lectures);
});
test('lectures can belong only to a subject in their own course before uploading', async () => {
  const course = { subjects: ['English'], lectures: [], save: async () => {} }; Course.findById = async () => course; uploaded = 0;
  await assert.rejects(service.addLecture('course', { video: [{}] }, { title: 'Lecture', subject: 'History' }), { statusCode: 400 }); assert.equal(uploaded, 0);
  await service.addLecture('course', { video: [{}] }, { title: 'Lecture', subject: 'English' }); assert.equal(course.lectures[0].subject, 'English'); assert.equal(uploaded, 1);
});
test('unassigned lectures retain the direct flow and YouTube/PDF options remain compatible', async () => {
  const course = { subjects: [], lectures: [], save: async () => {} }; Course.findById = async () => course;
  await service.addLecture('course', {}, { title: 'Lecture', youtubeUrl: 'https://youtu.be/M7lc1UVf-VE' });
  assert.equal(course.lectures[0].subject, ''); assert.equal(course.lectures[0].videoSource, 'youtube');
});
