const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source: { type: String, enum: ['test-series', 'current-affairs', 'previous-paper'], required: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, default: null },
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  questionText: { type: String, required: true },
  reason: { type: String, enum: ['wrong-answer', 'question-error', 'translation', 'other'], required: true },
  details: { type: String, trim: true, maxlength: 2000, default: '' },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending', index: true },
}, { timestamps: true, versionKey: false });
schema.index({ user: 1, source: 1, sourceId: 1, testId: 1, questionId: 1 }, { unique: true });
module.exports = mongoose.model('QuestionReport', schema);
