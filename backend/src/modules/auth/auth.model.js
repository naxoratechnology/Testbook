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
    emailVerified: { type: Boolean, default: false, index: true },
    registrationOtpHash: { type: String, default: '', select: false },
    registrationOtpExpiresAt: { type: Date, default: null, select: false },
    registrationOtpAttempts: { type: Number, default: 0, select: false },
    registrationOtpSentAt: { type: Date, default: null, select: false },
    identityDocumentUrl: { type: String, default: '' },
    identityDocumentPublicId: { type: String, default: '', select: false },
    identityDocumentResourceType: { type: String, enum: ['', 'image', 'raw'], default: '', select: false },
    identityDocumentName: { type: String, default: '' },
    identityVerificationStatus: { type: String, enum: ['not_submitted', 'pending', 'approved', 'rejected'], default: 'not_submitted', index: true },
    identityVerificationNote: { type: String, trim: true, maxlength: 500, default: '' },
    identitySubmittedAt: { type: Date, default: null },
    identityVerifiedAt: { type: Date, default: null },
    identityVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    passwordResetOtpHash: { type: String, default: '', select: false },
    passwordResetOtpExpiresAt: { type: Date, default: null, select: false },
    passwordResetOtpAttempts: { type: Number, default: 0, select: false },
    passwordResetOtpSentAt: { type: Date, default: null, select: false },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('User', authSchema);
