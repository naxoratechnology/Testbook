const test = require('node:test');
const assert = require('node:assert/strict');
const Course = require('../src/modules/course/course.model');
const courseService = require('../src/modules/course/course.service');
const { validateCourse } = require('../src/modules/course/course.validation');
const Series = require('../src/modules/testSeries/testSeries.model');
const Purchase = require('../src/modules/testSeries/testSeries.purchase.model');
const Attempt = require('../src/modules/testSeries/testSeries.attempt.model');
const seriesService = require('../src/modules/testSeries/testSeries.service');

const question = { text: 'Question', options: ['A', 'B'], correctAnswer: 0, marks: 1, negativeMarks: 0 };
const series = () => new Series({ title: 'Paid series', description: 'Details', exam: 'SSC', access: 'paid', price: 99, status: 'published', createdBy: '507f1f77bcf86cd799439010', tests: [{ title: 'Demo test', duration: 10, status: 'published', isPreview: true, questions: [question] }] });

test('paid course reveals only selected demo lectures and rejects a third', async () => {
  Course.findOne = () => ({ lean: async () => ({ _id: 'course', title: 'Paid course', access: 'paid', status: 'published', lectures: [{ _id: 'one', url: 'demo.mp4', pdfUrl: 'demo.pdf', isPreview: true }, { _id: 'two', url: 'paid.mp4', pdfUrl: 'paid.pdf', isPreview: false }] }) });
  const result = await courseService.findById('course');
  assert.equal(result.lectures[0].url, 'demo.mp4');
  assert.equal(result.lectures[1].url, '');
  assert.equal(result.lectures[1].pdfUrl, '');
  const course = { subjects: [], lectures: [{ isPreview: true }, { isPreview: true }] };
  Course.findById = async () => course;
  await assert.rejects(courseService.addLecture('course', {}, { title: 'Third', youtubeUrl: 'https://youtu.be/M7lc1UVf-VE', isPreview: 'true' }), { statusCode: 400 });
  const details = { title: 'Course', description: 'Details', exam: 'SSC', category: 'SSC', instructor: 'Teacher', access: 'paid', price: 99 };
  assert.ok(validateCourse({ ...details, lectures: [{ isPreview: true }, { isPreview: true }, { isPreview: true }] }).errors.lectures);
});

test('paid series permits demo attempts without purchase and limits demos to two', async () => {
  const item = series();
  Series.findOne = async () => item;
  Purchase.exists = async () => { throw new Error('Purchase lookup should not run for demo tests'); };
  Attempt.create = async (data) => ({ ...data, toObject: () => data });
  const demo = item.tests[0];
  const result = await seriesService.attempt('student', String(item._id), String(demo._id), { [String(demo.questions[0]._id)]: 0 });
  assert.equal(result.correct, 1);
  item.tests.push({ title: 'Second', duration: 10, isPreview: true, questions: [question] });
  Series.findById = async () => item;
  await assert.rejects(seriesService.addTest(String(item._id), { title: 'Third', duration: 10, isPreview: true, questions: [question] }), { statusCode: 400 });
  item.tests.push({ title: 'Paid', duration: 10, questions: [question] });
  await assert.rejects(seriesService.updateTest(String(item._id), String(item.tests[2]._id), { title: 'Paid', duration: 10, isPreview: true, questions: [question] }), { statusCode: 400 });
});
