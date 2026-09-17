const test = require('node:test');
const assert = require('node:assert/strict');
const Series = require('../src/modules/testSeries/testSeries.model');
const Attempt = require('../src/modules/testSeries/testSeries.attempt.model');
const Purchase = require('../src/modules/testSeries/testSeries.purchase.model');
const Report = require('../src/modules/questionReview/questionReview.model');
const service = require('../src/modules/questionReview/questionReview.service');
const validation = require('../src/modules/questionReview/questionReview.validation');
const user = '507f1f77bcf86cd799439010';
const ref = { source: 'test-series', sourceId: '507f1f77bcf86cd799439011', testId: '507f1f77bcf86cd799439012' };
const questionId = '507f1f77bcf86cd799439013';
const question = { _id: questionId, text: 'Question', options: ['A', 'B'], correctAnswer: 1, explanation: 'Explanation', marks: 2 };
const source = (access = 'free') => ({ title: 'Series', access, tests: [{ _id: ref.testId, status: 'published', title: 'Test', questions: [question] }] });
const latestAttempt = (value) => { Attempt.findOne = (filter) => { assert.deepEqual(filter, { user, series: ref.sourceId, test: ref.testId }); return { sort: () => ({ lean: async () => value }) }; }; };

test('unattempted tests cannot expose solutions', async () => {
  latestAttempt(null);
  await assert.rejects(service.solution(user, ref, 'student'), { statusCode: 403 });
});
test('solutions load from the authenticated user’s latest saved attempt', async () => {
  latestAttempt({ _id: 'attempt', answers: { [questionId]: 0 } });
  Series.findOne = (filter) => { assert.equal(filter.status, 'published'); return { lean: async () => source() }; };
  const result = await service.solution(user, ref, 'student');
  assert.equal(result.title, 'Test'); assert.equal(result.answers[questionId], 0);
  assert.equal(result.questions[0].correctAnswer, 1); assert.equal(result.totalMarks, 2);
});
test('paid solution access still requires an active purchase', async () => {
  latestAttempt({ _id: 'attempt' }); Series.findOne = () => ({ lean: async () => source('paid') });
  Purchase.exists = async () => null;
  await assert.rejects(service.solution(user, ref, 'student'), { statusCode: 403 });
});
test('attempt summaries are user-scoped and deduplicated per test', async () => {
  Attempt.find = (filter) => { assert.deepEqual(filter, { user }); return { sort: () => ({ select: () => ({ lean: async () => [{ _id: 'latest', series: ref.sourceId, test: ref.testId }, { _id: 'older', series: ref.sourceId, test: ref.testId }] }) }) }; };
  const items = await service.attempts(user, { source: 'test-series' });
  assert.equal(items.length, 1); assert.equal(items[0]._id, 'latest');
});
test('report validation rejects invalid reasons and missing other details', () => {
  assert.throws(() => validation.report({ ...ref, questionId, reason: 'invalid' }), { statusCode: 400 });
  assert.throws(() => validation.report({ ...ref, questionId, reason: 'other', details: '' }), { statusCode: 400 });
  assert.throws(() => validation.report({ ...ref, questionId, reason: 'wrong-answer', details: 'x'.repeat(2001) }), { statusCode: 400 });
});
test('reports are saved with server-owned question text and authenticated owner', async () => {
  latestAttempt({ _id: 'attempt' }); Series.findOne = () => ({ lean: async () => source() });
  Report.findOneAndUpdate = async (filter, update, options) => {
    assert.equal(filter.user, user); assert.equal(filter.questionId, questionId); assert.equal(options.upsert, true);
    assert.equal(update.$setOnInsert.questionText, 'Question'); assert.equal(update.$setOnInsert.details, 'Check answer');
    return { _id: 'report', status: 'pending' };
  };
  assert.deepEqual(await service.report(user, { ...ref, questionId, reason: 'wrong-answer', details: 'Check answer', user: 'forged' }, 'student'), { _id: 'report', status: 'pending' });
});
test('report question must belong to the attempted test', async () => {
  latestAttempt({ _id: 'attempt' }); Series.findOne = () => ({ lean: async () => source() });
  await assert.rejects(service.report(user, { ...ref, questionId: user, reason: 'question-error' }, 'student'), { statusCode: 404 });
});
test('prototype keys are not accepted as sources', async () => {
  await assert.rejects(service.attempts(user, { source: '__proto__' }), { statusCode: 400 });
});
