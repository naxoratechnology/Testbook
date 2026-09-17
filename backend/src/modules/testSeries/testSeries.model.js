const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  options: { type: [String], required: true, validate: (v) => v.length >= 2 },
  correctAnswer: { type: Number, required: true, min: 0 },
  explanation: { type: String, default: '' },
  marks: { type: Number, default: 1, min: 0 },
  negativeMarks: { type: Number, default: 0, min: 0 },
}, { _id: true });

const testSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  duration: { type: Number, required: true, min: 1 },
  questions: { type: [questionSchema], default: [] },
  status: { type: String, enum: ['draft', 'published', 'unpublished'], default: 'draft' },
}, { timestamps: true });

const seriesSchema = new mongoose.Schema({
  thumbnail: { type: String, default: '', trim: true },
  thumbnailPublicId: { type: String, default: '', select: false },
  title: { type: String, required: true, trim: true, maxlength: 180, index: true },
  description: { type: String, required: true, trim: true },
  exam: { type: String, required: true, trim: true, index: true },
  kind: { type: String, enum: ['full', 'sectional', 'current-affairs', 'previous-year'], default: 'full' },
  access: { type: String, enum: ['free', 'paid'], default: 'free', index: true },
  price: { type: Number, min: 0, default: 0 },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], default: 'Moderate' },
  languages: { type: String, default: 'English' },
  tests: { type: [testSchema], default: [] },
  status: { type: String, enum: ['draft', 'published', 'unpublished'], default: 'draft', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('TestSeries', seriesSchema);
