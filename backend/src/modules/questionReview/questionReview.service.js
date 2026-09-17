const Series = require('../testSeries/testSeries.model');
const SeriesAttempt = require('../testSeries/testSeries.attempt.model');
const Purchase = require('../testSeries/testSeries.purchase.model');
const Affairs = require('../currentAffairs/currentAffairs.model');
const AffairsAttempt = require('../currentAffairs/currentAffairs.attempt.model');
const Paper = require('../previousPaper/previousPaper.model');
const PaperAttempt = require('../previousPaper/previousPaper.attempt.model');
const Report = require('./questionReview.model');
const validation = require('./questionReview.validation');
const { validateId } = require('../bookmark/bookmark.validation');
const sources = { 'test-series': { Model: Series, Attempt: SeriesAttempt, field: 'series' }, 'current-affairs': { Model: Affairs, Attempt: AffairsAttempt, field: 'currentAffairs' }, 'previous-paper': { Model: Paper, Attempt: PaperAttempt, field: 'paper' } };

async function attempts(userId, query) {
  if (!['test-series', 'current-affairs', 'previous-paper'].includes(query.source)) throw Object.assign(new Error('Invalid question source.'), { statusCode: 400 });
  const config = sources[query.source];
  if (!config) throw Object.assign(new Error('Invalid question source.'), { statusCode: 400 });
  const filter = { user: userId };
  if (query.sourceId) filter[config.field] = validateId(query.sourceId);
  const items = await config.Attempt.find(filter).sort({ submittedAt: -1, _id: -1 }).select(`${config.field} test submittedAt`).lean();
  const seen = new Set();
  return items.filter((item) => { const key = `${item[config.field]}:${item.test || ''}`; if (seen.has(key)) return false; seen.add(key); return true; }).map((item) => ({ _id: item._id, source: query.source, sourceId: item[config.field], testId: item.test || null, submittedAt: item.submittedAt }));
}
async function solution(userId, query, role) {
  const ref = validation.reference(query);
  const config = sources[ref.source];
  const filter = { user: userId, [config.field]: ref.sourceId };
  if (ref.testId) filter.test = ref.testId;
  const attempt = await config.Attempt.findOne(filter).sort({ submittedAt: -1, _id: -1 }).lean();
  if (!attempt) throw Object.assign(new Error('Attempt this test before viewing its solution.'), { statusCode: 403 });
  const item = await config.Model.findOne({ _id: ref.sourceId, status: 'published' }).lean();
  if (!item) throw Object.assign(new Error('Test not found.'), { statusCode: 404 });
  if (ref.source === 'previous-paper') await require('../previousPaper/previousPaper.payment.service').requireAccess(userId, role);
  let questions = item.questions; let title = item.title;
  if (ref.source === 'test-series') {
    if (item.access === 'paid' && role !== 'admin' && !await Purchase.exists({ user: userId, series: ref.sourceId, status: 'active' })) throw Object.assign(new Error('Purchase this series to view its solutions.'), { statusCode: 403 });
    const test = item.tests.find((entry) => String(entry._id) === ref.testId && entry.status === 'published');
    if (!test) throw Object.assign(new Error('Test not found.'), { statusCode: 404 });
    questions = test.questions; title = test.title;
  }
  return { ...attempt, title, testTitle: title, questions, totalMarks: questions.reduce((sum, question) => sum + (question.marks ?? 1), 0) };
}
async function report(userId, body, role) {
  const value = validation.report(body);
  const result = await solution(userId, value, role);
  const question = result.questions.find((entry) => String(entry._id) === value.questionId);
  if (!question) throw Object.assign(new Error('Question not found.'), { statusCode: 404 });
  const filter = { user: userId, source: value.source, sourceId: value.sourceId, testId: value.testId, questionId: value.questionId };
  let saved;
  try { saved = await Report.findOneAndUpdate(filter, { $setOnInsert: { ...filter, title: result.title, questionText: question.text, reason: value.reason, details: value.details } }, { upsert: true, new: true, runValidators: true }); }
  catch (error) { if (error.code !== 11000) throw error; saved = await Report.findOne(filter); }
  return { _id: saved._id, status: saved.status };
}
async function reports() { return Report.find({}).sort({ createdAt: -1 }).limit(100).populate('user', 'name email').lean(); }
module.exports = { attempts, solution, report, reports };
module.exports.updateReportStatus = async (id, status) => {
  validateId(id);
  if (!['pending', 'resolved'].includes(status)) throw Object.assign(new Error('Invalid report status.'), { statusCode: 400 });
  const report = await Report.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).populate('user', 'name email');
  if (!report) throw Object.assign(new Error('Report not found.'), { statusCode: 404 });
  return report;
};
