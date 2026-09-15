const Series = require('./testSeries.model');
const Purchase = require('./testSeries.purchase.model');
const Attempt = require('./testSeries.attempt.model');
const notifications = require('../notification/notification.service');

async function create(data, userId) { const item = await Series.create({ ...data, createdBy: userId }); if (item.status === 'published') await notifications.publish({ title: 'New test series available', message: item.title, type: 'test-series', href: `/test-series/${item._id}`, userId }); return item; }
function publicSeries(item, purchased = false) {
  const value = item.toObject ? item.toObject() : item;
  return { ...value, purchased: value.access === 'free' || purchased, tests: (value.tests || []).filter((test) => test.status === 'published').map((test) => ({ ...test, questions: (test.questions || []).map(({ correctAnswer, explanation, ...question }) => question) })) };
}
async function list(query = {}, admin = false, userId = null) {
  const filter = admin ? {} : { status: 'published' };
  if (query.exam) filter.exam = query.exam;
  if (query.access) filter.access = query.access;
  const items = await Series.find(filter).sort({ createdAt: -1 }).lean();
  if (admin) return items; const purchasedIds = userId ? await Purchase.find({ user: userId, status: 'active' }).distinct('series') : []; const access = new Set(purchasedIds.map(String)); return items.map((item) => publicSeries(item, access.has(String(item._id))));
}
async function find(id, admin = false, userId = null) { const item = await Series.findOne(admin ? { _id: id } : { _id: id, status: 'published' }).lean(); if (!item) throw Object.assign(new Error('Test series not found.'), { statusCode: 404 }); if (admin) return item; const purchased = Boolean(userId && await Purchase.exists({ user: userId, series: id, status: 'active' })); return publicSeries(item, purchased); }
async function update(id, data) { const item = await Series.findByIdAndUpdate(id, data, { new: true, runValidators: true }); if (!item) throw Object.assign(new Error('Test series not found.'), { statusCode: 404 }); return item; }
async function remove(id) { if (!await Series.findByIdAndDelete(id)) throw Object.assign(new Error('Test series not found.'), { statusCode: 404 }); }
async function addTest(seriesId, data) { const item = await Series.findById(seriesId); if (!item) throw Object.assign(new Error('Test series not found.'), { statusCode: 404 }); item.tests.push(data); await item.save(); return item; }
async function purchase(userId, seriesId) { const item = await Series.findOne({ _id: seriesId, status: 'published' }); if (!item) throw Object.assign(new Error('Test series not found.'), { statusCode: 404 }); if (item.access === 'paid') throw Object.assign(new Error('Payment is required before purchasing this series.'), { statusCode: 402 }); return Purchase.findOneAndUpdate({ user: userId, series: seriesId }, { status: 'active' }, { upsert: true, new: true }); }
async function attempt(userId, seriesId, testId, answers = {}) {
  const item = await Series.findOne({ _id: seriesId, status: 'published' }); if (!item) throw Object.assign(new Error('Test series not found.'), { statusCode: 404 });
  const test = item.tests.id(testId); if (!test || test.status !== 'published') throw Object.assign(new Error('Test not found.'), { statusCode: 404 });
  if (item.access === 'paid' && !(await Purchase.exists({ user: userId, series: seriesId, status: 'active' }))) throw Object.assign(new Error('Purchase this series before attempting it.'), { statusCode: 403 });
  let score = 0; let correct = 0; let incorrect = 0; let unanswered = 0;
  test.questions.forEach((question) => { const answer = answers[question._id.toString()]; if (answer === undefined || answer === null) unanswered += 1; else if (Number(answer) === question.correctAnswer) { correct += 1; score += question.marks; } else { incorrect += 1; score -= question.negativeMarks; } });
  const total = test.questions.length; const result = await Attempt.create({ user: userId, series: seriesId, test: testId, answers, score, correct, incorrect, unanswered, accuracy: total ? Math.round((correct / total) * 100) : 0 });
  return { ...result.toObject(), testTitle: test.title, totalMarks: test.questions.reduce((sum, question) => sum + question.marks, 0), questions: test.questions.map((question) => question.toObject()) };
}
async function results(userId, seriesId) { return Attempt.find({ user: userId, series: seriesId }).sort({ submittedAt: -1 }).lean(); }
module.exports = { create, list, find, update, remove, addTest, purchase, attempt, results };
