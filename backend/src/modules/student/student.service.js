const User = require('../auth/auth.model');
const Purchase = require('../testSeries/testSeries.purchase.model');
const Attempt = require('../testSeries/testSeries.attempt.model');

const projection = '-password';

const listStudents = async ({ active, exam, search }) => {
  const filter = { role: 'student' };
  if (active !== undefined) filter.isActive = active;
  if (exam) filter.targetExam = exam;
  if (search) {
    const term = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: term }, { email: term }, { mobile: term }];
  }
  const students = await User.find(filter, projection).sort({ createdAt: -1 }).lean();
  const ids = students.map((student) => student._id);
  const [purchases, attempts] = await Promise.all([
    Purchase.aggregate([{ $match: { user: { $in: ids }, status: 'active' } }, { $group: { _id: '$user', count: { $sum: 1 } } }]),
    Attempt.aggregate([{ $match: { user: { $in: ids } } }, { $group: { _id: '$user', count: { $sum: 1 }, averageAccuracy: { $avg: '$accuracy' } } }]),
  ]);
  const purchaseMap = new Map(purchases.map((item) => [String(item._id), item.count]));
  const attemptMap = new Map(attempts.map((item) => [String(item._id), item]));
  return students.map((student) => ({ ...student, purchasedSeries: purchaseMap.get(String(student._id)) || 0, attempts: attemptMap.get(String(student._id))?.count || 0, averageAccuracy: Math.round(attemptMap.get(String(student._id))?.averageAccuracy || 0) }));
};

const getStudent = async (id) => {
  const student = await User.findOne({ _id: id, role: 'student' }, projection).lean();
  if (!student) return null;
  const [purchases, attempts] = await Promise.all([
    Purchase.find({ user: id, status: 'active' }).populate('series', 'title access status').sort({ createdAt: -1 }).lean(),
    Attempt.find({ user: id }).populate('series', 'title tests').sort({ submittedAt: -1 }).lean(),
  ]);
  const testAttempts = attempts.map((attempt) => { const series = attempt.series; const test = series?.tests?.find((item) => String(item._id) === String(attempt.test)); return { _id: attempt._id, seriesTitle: series?.title || 'Test Series', testTitle: test?.title || 'Test', score: attempt.score, accuracy: attempt.accuracy, correct: attempt.correct, incorrect: attempt.incorrect, unanswered: attempt.unanswered, submittedAt: attempt.submittedAt }; });
  return { ...student, purchasedSeries: purchases.map((purchase) => purchase.series).filter(Boolean), testAttempts, averageAccuracy: testAttempts.length ? Math.round(testAttempts.reduce((sum, attempt) => sum + attempt.accuracy, 0) / testAttempts.length) : 0 };
};
const updateStatus = (id, isActive) => User.findOneAndUpdate({ _id: id, role: 'student' }, { $set: { isActive } }, { new: true, projection }).lean();
const deleteStudent = (id) => User.findOneAndDelete({ _id: id, role: 'student' }, { projection }).lean();

module.exports = { listStudents, getStudent, updateStatus, deleteStudent };
