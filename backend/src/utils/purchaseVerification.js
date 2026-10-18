const User = require('../modules/auth/auth.model');

async function requirePurchaseVerification(userId) {
  const user = await User.findById(userId).select('role emailVerified identityVerificationStatus').lean();
  if (!user || user.role !== 'student') throw Object.assign(new Error('Student account not found.'), { statusCode: 404 });
  if (!user.emailVerified) throw Object.assign(new Error('Verify your email before making a purchase.'), { statusCode: 403, code: 'EMAIL_VERIFICATION_REQUIRED' });
  if (user.identityVerificationStatus !== 'approved') {
    const messages = {
      pending: 'Your identity document is awaiting admin approval.',
      rejected: 'Your identity verification was rejected. Upload a valid document from your profile.',
      not_submitted: 'Upload an identity document and wait for admin approval before making a purchase.',
    };
    throw Object.assign(new Error(messages[user.identityVerificationStatus] || messages.not_submitted), { statusCode: 403, code: 'IDENTITY_VERIFICATION_REQUIRED' });
  }
}

module.exports = { requirePurchaseVerification };
