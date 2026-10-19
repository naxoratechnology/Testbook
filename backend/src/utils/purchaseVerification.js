const User = require('../modules/auth/auth.model');

async function requirePurchaseVerification(userId) {
  const user = await User.findById(userId).select('role emailVerified').lean();
  if (!user || user.role !== 'student') throw Object.assign(new Error('Student account not found.'), { statusCode: 404 });
  if (!user.emailVerified) throw Object.assign(new Error('Verify your email before making a purchase.'), { statusCode: 403, code: 'EMAIL_VERIFICATION_REQUIRED' });
}

module.exports = { requirePurchaseVerification };
