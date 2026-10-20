const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  thumbnail: { type: String, default: '' },
  thumbnailPublicId: { type: String, default: '', select: false },
  name: { type: String, required: true, trim: true, maxlength: 180, index: true },
  description: { type: String, default: '' }, exam: { type: String, required: true, index: true }, subject: { type: String, required: true, index: true },
  collection: { type: mongoose.Schema.Types.ObjectId, ref: 'NotesCollection', default: null, index: true },
  pdfUrl: { type: String, required: true }, pdfPublicId: { type: String, required: true }, fileType: { type: String, enum: ['pdf', 'docx'], default: 'pdf' }, resourceType: { type: String, default: 'raw' }, pages: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published', 'unpublished'], default: 'draft', index: true }, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  access: { type: String, enum: ['free', 'paid'], default: 'free', index: true }, price: { type: Number, min: 0, max: 1000000, default: 0 },
}, { timestamps: true, versionKey: false });
schema.index({ name: 'text', description: 'text', exam: 'text', subject: 'text' });
module.exports = mongoose.model('Notes', schema);
