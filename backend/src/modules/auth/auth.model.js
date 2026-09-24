const mongoose = require('mongoose');

const authSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, index: true },
    mobile: { type: String, required: true, unique: true, trim: true, maxlength: 20, index: true },
    password: { type: String, required: true, minlength: 60, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student', index: true },
    targetExam: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date, default: null },
    passwordResetOtpHash: { type: String, default: '', select: false },
    passwordResetOtpExpiresAt: { type: Date, default: null, select: false },
    passwordResetOtpAttempts: { type: Number, default: 0, select: false },
    passwordResetOtpSentAt: { type: Date, default: null, select: false },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('User', authSchema);
