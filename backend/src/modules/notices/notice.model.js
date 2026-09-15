const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180, index: true },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  type: { type: String, enum: ['vacancy', 'job', 'general'], default: 'general', index: true },
  organization: { type: String, trim: true, maxlength: 180, default: '' },
  location: { type: String, trim: true, maxlength: 180, default: '' },
  eligibility: { type: String, trim: true, maxlength: 1000, default: '' },
  lastDate: { type: Date, default: null, index: true },
  applyUrl: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['draft', 'published', 'unpublished'], default: 'draft', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true, versionKey: false });

noticeSchema.index({ title: 'text', description: 'text', organization: 'text', location: 'text' });
module.exports = mongoose.model('Notice', noticeSchema);
