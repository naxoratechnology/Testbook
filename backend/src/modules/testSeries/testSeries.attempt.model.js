const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  series: { type: mongoose.Schema.Types.ObjectId, ref: 'TestSeries', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, required: true },
  answers: { type: Map, of: Number, default: {} },
  score: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  incorrect: { type: Number, default: 0 },
  unanswered: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true, versionKey: false });
module.exports = mongoose.model('TestSeriesAttempt', schema);
