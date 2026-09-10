const mongoose = require('mongoose');
const schema = new mongoose.Schema({ name: { type: String, required: true, trim: true, maxlength: 180, index: true }, pdfUrl: { type: String, required: true }, pdfPublicId: { type: String, required: true }, status: { type: String, enum: ['draft', 'published', 'unpublished'], default: 'draft', index: true }, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } }, { timestamps: true, versionKey: false });
module.exports = mongoose.model('Syllabus', schema);
