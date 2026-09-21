const Bookmark = require('./bookmark.model');
const Series = require('../testSeries/testSeries.model');
const Purchase = require('../testSeries/testSeries.purchase.model');
const Affairs = require('../currentAffairs/currentAffairs.model');
const Paper = require('../previousPaper/previousPaper.model');
const { validateId, validateSource } = require('./bookmark.validation');

function findQuestion(item, ref) {
  if (!item) return null;
  if (ref.source === 'test-series') {
    const test = (item.tests || []).find((entry) => String(entry._id) === String(ref.testId));
    return (test?.questions || []).find((entry) => String(entry._id) === String(ref.questionId)) || null;
  }
  return (item.questions || []).find((entry) => String(entry._id) === String(ref.questionId)) || null;
}

function answerSnapshot(question) {
  return { correctAnswer: question.correctAnswer, explanation: question.explanation || '' };
}

async function list(userId) {
  const bookmarks = await Bookmark.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return Promise.all(bookmarks.map(async (bookmark) => {
    if (Number.isInteger(bookmark.question?.correctAnswer)) return bookmark;
    const Model = bookmark.source === 'test-series' ? Series : bookmark.source === 'current-affairs' ? Affairs : Paper;
    const source = await Model.findById(bookmark.sourceId).lean();
    const question = findQuestion(source, bookmark);
    if (!question) return bookmark;
    const answer = answerSnapshot(question);
    await Bookmark.updateOne({ _id: bookmark._id, user: userId }, { $set: { 'question.correctAnswer': answer.correctAnswer, 'question.explanation': answer.explanation } });
    return { ...bookmark, question: { ...bookmark.question, ...answer } };
  }));
}
async function save(userId, body, role) {
  const ref = validateSource(body);
  const Model = ref.source === 'test-series' ? Series : ref.source === 'current-affairs' ? Affairs : Paper;
  const item = await Model.findOne({ _id: ref.sourceId, status: 'published' }).lean();
  if (!item) throw Object.assign(new Error('Question source not found.'), { statusCode: 404 });
  if (ref.source === 'previous-paper') await require('../previousPaper/previousPaper.payment.service').requireAccess(userId, role);
  let questions = item.questions;
  let title = item.title;
  if (ref.source === 'test-series') {
    const test = item.tests.find((entry) => String(entry._id) === ref.testId && entry.status === 'published');
    if (!test) throw Object.assign(new Error('Test not found.'), { statusCode: 404 });
    if (item.access === 'paid' && !test.isPreview && role !== 'admin' && !await Purchase.exists({ user: userId, series: ref.sourceId, status: 'active' })) throw Object.assign(new Error('Purchase this series before saving its questions.'), { statusCode: 403 });
    questions = test.questions; title = `${item.title} — ${test.title}`;
  }
  const question = (questions || []).find((entry) => String(entry._id) === ref.questionId);
  if (!question) throw Object.assign(new Error('Question not found.'), { statusCode: 404 });
  const snapshot = { text: question.text, options: question.options, correctAnswer: question.correctAnswer, explanation: question.explanation || '', marks: question.marks ?? 1, negativeMarks: question.negativeMarks ?? 0 };
  const filter = { user: userId, ...ref };
  try { return await Bookmark.findOneAndUpdate(filter, { $setOnInsert: { ...filter, title, question: snapshot } }, { upsert: true, new: true, runValidators: true }); }
  catch (error) { if (error.code === 11000) return Bookmark.findOne(filter); throw error; }
}
async function remove(userId, id) {
  validateId(id);
  if (!await Bookmark.findOneAndDelete({ _id: id, user: userId })) throw Object.assign(new Error('Saved question not found.'), { statusCode: 404 });
}
module.exports = { list, save, remove };
