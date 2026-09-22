const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  subtitle: { type: String, default: '', trim: true, maxlength: 300 },
  showText: { type: Boolean, default: false },
  thumbnail: { type: String, default: '' },
  thumbnailPublicId: { type: String, default: '', select: false },
  buttonLabel: { type: String, default: '', trim: true, maxlength: 40 },
  buttonUrl: { type: String, default: '', trim: true, maxlength: 300 },
  placement: { type: String, enum: ['home', 'dashboard', 'both'], default: 'both' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  order: { type: Number, default: 0, min: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true, versionKey: false });
module.exports = mongoose.model('Banner', schema);
