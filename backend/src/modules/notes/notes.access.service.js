const Notes = require('./notes.model');
const Purchase = require('./notes.purchase.model');

async function purchasedExamNames(userId) {
  if (!userId) return new Set();
  const purchases = await Purchase.find({ user: userId, status: 'active' }).select('notes').lean();
  if (!purchases.length) return new Set();
  const noteIds = purchases.map((purchase) => purchase.notes).filter(Boolean);
  const notes = await Notes.find({ _id: { $in: noteIds } }).select('exam').lean();
  return new Set(notes.map((note) => note.exam).filter(Boolean));
}

async function hasExamAccess(userId, exam) {
  if (!userId || !exam) return false;
  const purchases = await Purchase.find({ user: userId, status: 'active' }).select('notes').lean();
  if (!purchases.length) return false;
  return Boolean(await Notes.exists({ _id: { $in: purchases.map((purchase) => purchase.notes).filter(Boolean) }, exam }));
}

module.exports = { purchasedExamNames, hasExamAccess };
