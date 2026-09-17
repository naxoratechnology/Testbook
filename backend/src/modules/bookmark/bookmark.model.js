const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  source: { type: String, enum: ['test-series', 'current-affairs', 'previous-paper'], required: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, default: null },
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  question: { text: { type: String, required: true }, options: { type: [String], required: true }, marks: { type: Number, default: 1 }, negativeMarks: { type: Number, default: 0 } },
}, { timestamps: true, versionKey: false });
schema.index({ user: 1, source: 1, sourceId: 1, testId: 1, questionId: 1 }, { unique: true });
module.exports = mongoose.model('Bookmark', schema);
