const Series = require('./testSeries.model');
const Purchase = require('./testSeries.purchase.model');
const Attempt = require('./testSeries.attempt.model');

async function create(data, userId) { return Series.create({ ...data, createdBy: userId }); }
async function list(query = {}, admin = false) {
  const filter = admin ? {} : { status: 'published' };
  if (query.exam) filter.exam = query.exam;
  if (query.access) filter.access = query.access;
  return Series.find(filter).sort({ createdAt: -1 }).lean();
}
async function find(id, admin = false) { const item = await Series.findOne(admin ? { _id: id } : { _id: id, status: 'published' }).lean(); if (!item) throw Object.assign(new Error('Test series not found.'), { statusCode: 404 }); return item; }
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
  const total = test.questions.length; const result = await Attempt.create({ user: userId, series: seriesId, test: testId, answers, score, correct, incorrect, unanswered, accuracy: total ? Math.round((correct / total) * 100) : 0 }); return result;
}
async function results(userId, seriesId) { return Attempt.find({ user: userId, series: seriesId }).sort({ submittedAt: -1 }).lean(); }
module.exports = { create, list, find, update, remove, addTest, purchase, attempt, results };
