const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  thumbnail: { type: String, default: '' },
  thumbnailPublicId: { type: String, default: '', select: false },
  title: { type: String, required: true, trim: true, maxlength: 180, index: true },
  description: { type: String, default: '' },
  exam: { type: String, required: true, trim: true, maxlength: 120, index: true },
  subjects: { type: [String], default: [] },
  access: { type: String, enum: ['free', 'paid'], default: 'free', index: true },
  price: { type: Number, min: 0, max: 1000000, default: 0 },
  status: { type: String, enum: ['draft', 'published', 'unpublished'], default: 'draft', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('NotesCollection', schema);
