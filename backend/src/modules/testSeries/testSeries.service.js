const { destroy } = require('../../config/cloudinary');
const Series = require('./testSeries.model');
const Purchase = require('./testSeries.purchase.model');
const Attempt = require('./testSeries.attempt.model');
const notifications = require('../notification/notification.service');
const mongoose = require('mongoose');

async function create(data, userId) { const item = await Series.create({ ...data, createdBy: userId }); if (item.status === 'published') await notifications.publish({ title: 'New test series available', message: item.title, type: 'test-series', href: `/test-series/${item._id}`, userId }); return item; }
function publicSeries(item, purchased = false) {
  const value = item.toObject ? item.toObject() : item;
  return { ...value, purchased: value.access === 'free' || purchased, tests: (value.tests || []).filter((test) => test.status === 'published').map((test) => { const { questions = [], ...summary } = test; return { ...summary, questionCount: questions.length }; }) };
}
async function list(query = {}, admin = false, userId = null) {
  const filter = admin ? {} : { status: 'published' };
  if (query.exam) filter.exam = query.exam;
  if (query.access) filter.access = query.access;
  const items = await Series.find(filter).sort({ createdAt: -1 }).lean();
  if (admin) return items; const purchasedIds = userId ? await Purchase.find({ user: userId, status: 'active' }).distinct('series') : []; const access = new Set(purchasedIds.map(String)); return items.map((item) => publicSeries(item, access.has(String(item._id))));
}
async function find(id, admin = false, userId = null) { const item = await Series.findOne(admin ? { _id: id } : { _id: id, status: 'published' }).lean(); if (!item) throw Object.assign(new Error('Test series not found.'), { statusCode: 404 }); if (admin) return item; const purchased = Boolean(userId && await Purchase.exists({ user: userId, series: id, status: 'active' })); return publicSeries(item, purchased); }
async function findAdminEditor(seriesId, testId = '') {
  if (!mongoose.isValidObjectId(seriesId) || (testId && !mongoose.isValidObjectId(testId))) throw Object.assign(new Error('Test series not found.'), { statusCode: 404 });
  const testObjectId = testId ? new mongoose.Types.ObjectId(testId) : null;
  const [item] = await Series.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(seriesId) } },
    { $project: {
      title: 1, access: 1, subjects: 1,
      previewCount: { $size: { $filter: { input: '$tests', as: 'test', cond: '$$test.isPreview' } } },
      tests: testObjectId ? { $filter: { input: '$tests', as: 'test', cond: { $eq: ['$$test._id', testObjectId] } } } : { $literal: [] },
    } },
  ]);
  if (!item) throw Object.assign(new Error('Test series not found.'), { statusCode: 404 });
  if (testId && !item.tests[0]) throw Object.assign(new Error('Test not found.'), { statusCode: 404 });
  return { series: { _id: item._id, title: item.title, access: item.access, subjects: item.subjects, previewCount: item.previewCount }, test: item.tests[0] || null };
}
async function findPublicTest(seriesId, testId, userId = null) {
  const item = await Series.findOne(
    { _id: seriesId, status: 'published', tests: { $elemMatch: { _id: testId, status: 'published' } } },
    { title: 1, languages: 1, access: 1, tests: { $elemMatch: { _id: testId, status: 'published' } } },
  ).lean();
  if (!item || !item.tests?.[0]) throw Object.assign(new Error('Test not found.'), { statusCode: 404 });
  const test = item.tests[0];
  if (item.access === 'paid' && !test.isPreview && !(userId && await Purchase.exists({ user: userId, series: seriesId, status: 'active' }))) throw Object.assign(new Error('Purchase this series before attempting it.'), { statusCode: 403 });
  return {
    series: { _id: item._id, title: item.title, languages: item.languages },
    test: { ...test, questions: (test.questions || []).map(({ correctAnswer, explanation, ...question }) => question) },
  };
}
async function update(id, data) { const item = await Series.findById(id); if (!item) throw Object.assign(new Error('Test series not found.'), { statusCode: 404 }); const removed = (item.subjects || []).filter(subject => !data.subjects?.includes(subject)); if (removed.some(subject => item.tests.some(test => test.subject === subject))) throw Object.assign(new Error('Move tests out of a subject before removing it.'), { statusCode: 400 }); item.set(data); await item.save(); return item; }
async function remove(id) {
  const item = await Series.findById(id).select('+thumbnailPublicId');
  if (!item) throw Object.assign(new Error('Test series not found.'), { statusCode: 404 });
  if (item.thumbnailPublicId) await destroy(item.thumbnailPublicId, 'image');
  await item.deleteOne();
}
async function addTest(seriesId, data) { const item = await Series.findById(seriesId); if (!item) throw Object.assign(new Error('Test series not found.'), { statusCode: 404 }); if (data.subject && !(item.subjects || []).includes(data.subject)) throw Object.assign(new Error('Choose a subject from this series.'), { statusCode: 400 }); if (data.isPreview && item.tests.filter((test) => test.isPreview).length >= 2) throw Object.assign(new Error('Choose no more than two free demo tests.'), { statusCode: 400 }); item.tests.push(data); await item.save(); return item; }
async function purchase(userId, seriesId) { const item = await Series.findOne({ _id: seriesId, status: 'published' }); if (!item) throw Object.assign(new Error('Test series not found.'), { statusCode: 404 }); if (item.access === 'paid') throw Object.assign(new Error('Payment is required before purchasing this series.'), { statusCode: 402 }); return Purchase.findOneAndUpdate({ user: userId, series: seriesId }, { status: 'active' }, { upsert: true, new: true }); }
async function attempt(userId, seriesId, testId, answers = {}) {
  const item = await Series.findOne(
    { _id: seriesId, status: 'published', tests: { $elemMatch: { _id: testId, status: 'published' } } },
    { access: 1, tests: { $elemMatch: { _id: testId, status: 'published' } } },
  ).lean();
  if (!item || !item.tests?.[0]) throw Object.assign(new Error('Test not found.'), { statusCode: 404 });
  const test = item.tests[0];
  if (item.access === 'paid' && !test.isPreview && !(await Purchase.exists({ user: userId, series: seriesId, status: 'active' }))) throw Object.assign(new Error('Purchase this series before attempting it.'), { statusCode: 403 });
  let score = 0; let correct = 0; let incorrect = 0; let unanswered = 0;
  test.questions.forEach((question) => { const answer = answers[question._id.toString()]; if (answer === undefined || answer === null) unanswered += 1; else if (Number(answer) === question.correctAnswer) { correct += 1; score += question.marks; } else { incorrect += 1; score -= question.negativeMarks; } });
  const total = test.questions.length; const result = await Attempt.create({ user: userId, series: seriesId, test: testId, answers, score, correct, incorrect, unanswered, accuracy: total ? Math.round((correct / total) * 100) : 0 });
  return { ...result.toObject(), testTitle: test.title, totalMarks: test.questions.reduce((sum, question) => sum + question.marks, 0), questions: test.questions };
}
async function results(userId, seriesId) { return Attempt.find({ user: userId, series: seriesId }).sort({ submittedAt: -1 }).lean(); }
async function updateTest(seriesId, testId, data) {
  const item = await Series.findById(seriesId);
  if (!item) throw Object.assign(new Error('Test series not found.'), { statusCode: 404 });
  const test = item.tests.id(testId);
  if (!test) throw Object.assign(new Error('Test not found.'), { statusCode: 404 });
  if (data.subject && !(item.subjects || []).includes(data.subject)) throw Object.assign(new Error('Choose a subject from this series.'), { statusCode: 400 });
  if (data.isPreview && item.tests.filter((entry) => entry.isPreview && String(entry._id) !== String(testId)).length >= 2) throw Object.assign(new Error('Choose no more than two free demo tests.'), { statusCode: 400 });
  const existingIds = new Set(test.questions.map((question) => String(question._id)));
  if (data.questions.some((question) => question._id && !existingIds.has(String(question._id)))) throw Object.assign(new Error('A question does not belong to this test.'), { statusCode: 400 });
  test.set(data);
  await item.save();
  return item;
}
async function removeTest(seriesId, testId) {
  const item = await Series.findById(seriesId);
  if (!item) throw Object.assign(new Error('Test series not found.'), { statusCode: 404 });
  const test = item.tests.id(testId);
  if (!test) throw Object.assign(new Error('Test not found.'), { statusCode: 404 });
  test.deleteOne(); await item.save(); return item;
}
module.exports = { create, list, find, findAdminEditor, findPublicTest, update, remove, addTest, updateTest, removeTest, purchase, attempt, results };
