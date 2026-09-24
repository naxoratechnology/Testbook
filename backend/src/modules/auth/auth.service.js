const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./auth.model');
const env = require('../../config/env');
const { sendPasswordResetOtp } = require('../../utils/mailer');
const output = (user) => ({ id: user._id.toString(), name: user.name, email: user.email, mobile: user.mobile, role: user.role, targetExam: user.targetExam });
const issue = (user) => {
  const payload = { sub: user._id.toString(), role: user.role };
  return { accessToken: jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpires }), refreshToken: jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpires }) };
};
async function register(data) {
  if (await User.exists({ $or: [{ email: data.email }, { mobile: data.mobile }] })) throw Object.assign(new Error('An account with this email or mobile already exists.'), { statusCode: 409 });
  const user = await User.create({ ...data, password: await bcrypt.hash(data.password, 12), role: 'student' });
  return { user: output(user), ...issue(user) };
}
async function login(identifier, password) {
  const user = await User.findOne({ $or: [{ email: identifier.toLowerCase() }, { mobile: identifier }] }).select('+password');
  if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) throw Object.assign(new Error('Invalid email/mobile or password.'), { statusCode: 401 });
  user.lastLoginAt = new Date(); await user.save();
  return { user: output(user), ...issue(user) };
}
async function me(id) { const user = await User.findById(id); if (!user || !user.isActive) throw Object.assign(new Error('User account not found.'), { statusCode: 404 }); return output(user); }
async function refresh(refreshToken) { if (!refreshToken) throw Object.assign(new Error('Refresh token is required.'), { statusCode: 401 }); let payload; try { payload = jwt.verify(refreshToken, env.jwt.refreshSecret); } catch (_error) { throw Object.assign(new Error('Invalid or expired refresh token.'), { statusCode: 401 }); } const user = await User.findById(payload.sub); if (!user || !user.isActive) throw Object.assign(new Error('User account not found.'), { statusCode: 401 }); return { user: output(user), ...issue(user) }; }
async function changePassword(id, currentPassword, newPassword) { const user = await User.findById(id).select('+password'); if (!user || !user.isActive) throw Object.assign(new Error('User account not found.'), { statusCode: 404 }); if (!(await bcrypt.compare(currentPassword, user.password))) throw Object.assign(new Error('Current password is incorrect.'), { statusCode: 400 }); user.password = await bcrypt.hash(newPassword, 12); await user.save(); }
const otpHash = (email, otp) => crypto.createHmac('sha256', env.jwt.accessSecret).update(`${email}:${otp}`).digest('hex');
async function forgotPassword(email) {
  const user = await User.findOne({ email, isActive: true }).select('+passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpAttempts +passwordResetOtpSentAt');
  if (!user) return;
  if (user.passwordResetOtpSentAt && Date.now() - user.passwordResetOtpSentAt.getTime() < 60000) return;
  const otp = String(crypto.randomInt(100000, 1000000));
  user.passwordResetOtpHash = otpHash(user.email, otp);
  user.passwordResetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  user.passwordResetOtpAttempts = 0;
  user.passwordResetOtpSentAt = new Date();
  await user.save();
  try { await sendPasswordResetOtp(user, otp); }
  catch (error) { user.passwordResetOtpHash = ''; user.passwordResetOtpExpiresAt = null; user.passwordResetOtpAttempts = 0; user.passwordResetOtpSentAt = null; await user.save(); throw error; }
}
async function resetPassword(email, otp, newPassword) {
  const user = await User.findOne({ email, isActive: true }).select('+password +passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpAttempts +passwordResetOtpSentAt');
  const invalid = () => { throw Object.assign(new Error('Invalid or expired OTP. Request a new code and try again.'), { statusCode: 400 }); };
  if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt || user.passwordResetOtpExpiresAt.getTime() < Date.now()) return invalid();
  if (user.passwordResetOtpAttempts >= 5) { user.passwordResetOtpHash = ''; user.passwordResetOtpExpiresAt = null; await user.save(); return invalid(); }
  const supplied = Buffer.from(otpHash(email, otp), 'hex');
  const expected = Buffer.from(user.passwordResetOtpHash, 'hex');
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) { user.passwordResetOtpAttempts += 1; await user.save(); return invalid(); }
  user.password = await bcrypt.hash(newPassword, 12);
  user.passwordResetOtpHash = '';
  user.passwordResetOtpExpiresAt = null;
  user.passwordResetOtpAttempts = 0;
  user.passwordResetOtpSentAt = null;
  await user.save();
}
module.exports = { register, login, me, refresh, changePassword, forgotPassword, resetPassword };
