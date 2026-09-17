const test = require('node:test');
const assert = require('node:assert/strict');
const Series = require('../src/modules/testSeries/testSeries.model');
const service = require('../src/modules/testSeries/testSeries.service');
const validation = require('../src/modules/testSeries/testSeries.validation');
const Report = require('../src/modules/questionReview/questionReview.model');
const review = require('../src/modules/questionReview/questionReview.service');
const question = { text: 'Original question', options: ['A', 'B'], correctAnswer: 0, marks: 2, negativeMarks: 0.5 };
const fixture = () => new Series({ title: 'Series', description: 'Description', exam: 'SSC', status: 'published', createdBy: '507f1f77bcf86cd799439010', tests: [{ title: 'Test', duration: 60, status: 'published', questions: [question] }] });

test('published tests accept new questions while preserving existing question IDs', async () => {
  const item = fixture(); const entry = item.tests[0]; const oldId = String(entry.questions[0]._id); const testId = String(entry._id);
  let saved = false; item.save = async () => { await item.validate(); saved = true; return item; };
  Series.findById = async () => item;
  await service.updateTest(String(item._id), testId, { title: 'Updated test', duration: 60, status: 'published', questions: [{ ...question, _id: oldId }, { ...question, text: 'Added question' }] });
  assert.equal(saved, true); assert.equal(item.status, 'published'); assert.equal(entry.status, 'published');
  assert.equal(entry.questions.length, 2); assert.equal(String(entry.questions[0]._id), oldId);
  assert.notEqual(String(entry.questions[1]._id), oldId); assert.equal(String(entry._id), testId);
});
test('foreign question IDs cannot be inserted into another test', async () => {
  const item = fixture(); Series.findById = async () => item;
  await assert.rejects(service.updateTest(String(item._id), String(item.tests[0]._id), { questions: [{ ...question, _id: '507f1f77bcf86cd799439099' }] }), { statusCode: 400 });
});
test('missing tests return 404 rather than creating duplicates', async () => {
  Series.findById = async () => fixture();
  await assert.rejects(service.updateTest('id', '507f1f77bcf86cd799439099', { questions: [question] }), { statusCode: 404 });
});
test('test deletion removes only the selected test', async () => {
  const item = fixture(); item.tests.push({ title: 'Other', duration: 10, questions: [question] });
  const retained = String(item.tests[1]._id); item.save = async () => item; Series.findById = async () => item;
  await service.removeTest(String(item._id), String(item.tests[0]._id));
  assert.equal(item.tests.length, 1); assert.equal(String(item.tests[0]._id), retained);
});
test('test validation rejects invalid answers, marks, timing and status', () => {
  const valid = { title: 'Test', duration: 60, status: 'published', questions: [question] };
  assert.deepEqual(validation.test(valid).errors, {});
  for (const payload of [{ ...valid, duration: 'invalid' }, { ...valid, status: 'invalid' }, { ...valid, questions: [{ ...question, correctAnswer: 4 }] }, { ...valid, questions: [{ ...question, marks: -1 }] }, { ...valid, questions: [null] }]) assert.ok(Object.keys(validation.test(payload).errors).length > 0);
});
test('admins can resolve and reopen reports with status validation', async () => {
  const id = '507f1f77bcf86cd799439010';
  Report.findByIdAndUpdate = (target, data, options) => { assert.equal(target, id); assert.equal(options.runValidators, true); return { populate: async () => ({ _id: id, status: data.status }) }; };
  assert.equal((await review.updateReportStatus(id, 'resolved')).status, 'resolved');
  assert.equal((await review.updateReportStatus(id, 'pending')).status, 'pending');
  await assert.rejects(review.updateReportStatus(id, 'invalid'), { statusCode: 400 });
});
