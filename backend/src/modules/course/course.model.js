const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  kind: { type: String, enum: ['video', 'pdf'], required: true },
  videoSource: { type: String, enum: ['upload', 'youtube'], default: 'upload' },
  url: { type: String, required: true, trim: true },
  duration: { type: String, trim: true, default: '' },
  isPreview: { type: Boolean, default: false },
  publicId: { type: String, default: '', required: function () { return this.videoSource !== 'youtube'; } },
  resourceType: { type: String, enum: ['video', 'raw', 'youtube'], required: true },
  pdfUrl: { type: String, default: '' },
  pdfPublicId: { type: String, default: '' },
  pdfResourceType: { type: String, default: 'raw' },
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180, index: true },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  exam: { type: String, required: true, trim: true, index: true },
  category: { type: String, required: true, trim: true, index: true },
  instructor: { type: String, required: true, trim: true, maxlength: 120 },
  thumbnail: { type: String, trim: true, default: '' },
  thumbnailPublicId: { type: String, default: '', select: false },
  access: { type: String, enum: ['free', 'paid'], required: true, index: true },
  price: { type: Number, min: 0, default: 0 },
  lectures: { type: [lessonSchema], default: [] },
  status: { type: String, enum: ['draft', 'published', 'unpublished'], default: 'draft', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publishedAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });

courseSchema.pre('validate', function validatePrice() {
  if (this.access === 'paid' && (!this.price || this.price <= 0)) {
    throw new Error('Paid courses must have a price greater than zero.');
  }
  if (this.access === 'free') this.price = 0;
});

courseSchema.index({ title: 'text', description: 'text', exam: 'text', category: 'text' });
module.exports = mongoose.model('Course', courseSchema);
