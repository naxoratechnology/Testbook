const test = require('node:test');
const assert = require('node:assert/strict');
const Bookmark = require('../src/modules/bookmark/bookmark.model');
const Series = require('../src/modules/testSeries/testSeries.model');
const Purchase = require('../src/modules/testSeries/testSeries.purchase.model');
const Affairs = require('../src/modules/currentAffairs/currentAffairs.model');
const service = require('../src/modules/bookmark/bookmark.service');
const { validateSource } = require('../src/modules/bookmark/bookmark.validation');
const user = '507f1f77bcf86cd799439010';
const ref = { source: 'test-series', sourceId: '507f1f77bcf86cd799439011', testId: '507f1f77bcf86cd799439012', questionId: '507f1f77bcf86cd799439013' };
const question = { _id: ref.questionId, text: 'Question text', options: ['A', 'B'], correctAnswer: 1, explanation: 'Private answer', marks: 2, negativeMarks: 0.5 };
const series = (access = 'free') => ({ title: 'Series', access, tests: [{ _id: ref.testId, title: 'Test', status: 'published', questions: [question] }] });

test('bookmark references reject invalid sources and IDs', () => {
  assert.throws(() => validateSource({ ...ref, source: 'other' }), { statusCode: 400 });
  assert.throws(() => validateSource({ ...ref, questionId: 'invalid' }), { statusCode: 400 });
  assert.throws(() => validateSource({ ...ref, testId: undefined }), { statusCode: 400 });
});
test('save is user-scoped, idempotent and does not leak correct answers', async () => {
  Series.findOne = (filter) => { assert.equal(filter.status, 'published'); return { lean: async () => series() }; };
  Bookmark.findOneAndUpdate = async (filter, update, options) => {
    assert.equal(filter.user, user); assert.equal(filter.questionId, ref.questionId);
    assert.equal(options.upsert, true); assert.equal(options.runValidators, true);
    assert.deepEqual(update.$setOnInsert.question, { text: question.text, options: question.options, marks: 2, negativeMarks: 0.5 });
    assert.equal(update.$setOnInsert.question.correctAnswer, undefined);
    assert.equal(update.$setOnInsert.question.explanation, undefined);
    return update.$setOnInsert;
  };
  const saved = await service.save(user, { ...ref, user: 'another-user', question: { text: 'Forged question' } }, 'student');
  assert.equal(saved.title, 'Series — Test'); assert.equal(saved.user, user);
});
test('unpublished or missing sources cannot be bookmarked', async () => {
  Series.findOne = () => ({ lean: async () => null });
  await assert.rejects(service.save(user, ref, 'student'), { statusCode: 404 });
});
test('paid questions cannot be bookmarked without an active purchase', async () => {
  Series.findOne = () => ({ lean: async () => series('paid') });
  Purchase.exists = async (filter) => { assert.equal(filter.user, user); assert.equal(filter.status, 'active'); return null; };
  await assert.rejects(service.save(user, ref, 'student'), { statusCode: 403 });
});
test('questions must belong to the referenced test', async () => {
  Series.findOne = () => ({ lean: async () => series() });
  await assert.rejects(service.save(user, { ...ref, questionId: user }, 'student'), { statusCode: 404 });
});
test('daily questions use server-owned snapshots and no test ID', async () => {
  Affairs.findOne = () => ({ lean: async () => ({ title: 'Daily test', questions: [question] }) });
  Bookmark.findOneAndUpdate = async (filter, update) => { assert.equal(filter.testId, null); return update.$setOnInsert; };
  const saved = await service.save(user, { ...ref, source: 'current-affairs' }, 'student');
  assert.equal(saved.title, 'Daily test'); assert.equal(saved.question.correctAnswer, undefined);
});
test('deletion is restricted to the authenticated owner', async () => {
  Bookmark.findOneAndDelete = async (filter) => { assert.deepEqual(filter, { _id: ref.questionId, user }); return null; };
  await assert.rejects(service.remove(user, ref.questionId), { statusCode: 404 });
});
test('listing never includes another user’s bookmarks', async () => {
  Bookmark.find = (filter) => { assert.deepEqual(filter, { user }); return { sort: () => ({ lean: async () => [] }) }; };
  assert.deepEqual(await service.list(user), []);
});
