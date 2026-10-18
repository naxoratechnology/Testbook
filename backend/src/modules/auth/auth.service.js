const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./auth.model');
const env = require('../../config/env');
const { sendPasswordResetOtp, sendRegistrationOtp } = require('../../utils/mailer');
const { uploadBuffer, destroy } = require('../../config/cloudinary');
const output = (user) => ({ id: user._id.toString(), name: user.name, email: user.email, mobile: user.mobile, role: user.role, targetExam: user.targetExam, emailVerified: user.role === 'admin' || Boolean(user.emailVerified), identityVerificationStatus: user.role === 'admin' ? 'approved' : (user.identityVerificationStatus || 'not_submitted'), identityDocumentName: user.identityDocumentName || '', identityVerificationNote: user.identityVerificationNote || '' });
const issue = (user) => {
  const payload = { sub: user._id.toString(), role: user.role };
  return { accessToken: jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpires }), refreshToken: jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpires }) };
};
async function register(data) {
  if (await User.exists({ $or: [{ email: data.email }, { mobile: data.mobile }] })) throw Object.assign(new Error('An account with this email or mobile already exists.'), { statusCode: 409 });
  const otp = String(crypto.randomInt(100000, 1000000));
  const user = await User.create({ ...data, password: await bcrypt.hash(data.password, 12), role: 'student', registrationOtpHash: otpHash(data.email, otp), registrationOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), registrationOtpSentAt: new Date() });
  try { await sendRegistrationOtp(user, otp); }
  catch (error) { await User.deleteOne({ _id: user._id }); throw error; }
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
async function updateProfile(id, data) {
  const user = await User.findById(id).select('+registrationOtpHash +registrationOtpExpiresAt +registrationOtpAttempts +registrationOtpSentAt');
  if (!user || !user.isActive) throw Object.assign(new Error('User account not found.'), { statusCode: 404 });
  const duplicate = await User.exists({ _id: { $ne: user._id }, $or: [{ email: data.email }, { mobile: data.mobile }] });
  if (duplicate) throw Object.assign(new Error('Another account already uses this email or mobile.'), { statusCode: 409 });
  const emailChanged = user.email !== data.email;
  user.name = data.name; user.email = data.email; user.mobile = data.mobile; user.targetExam = data.targetExam;
  if (emailChanged) {
    const otp = String(crypto.randomInt(100000, 1000000)); user.emailVerified = false; user.registrationOtpHash = otpHash(data.email, otp); user.registrationOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); user.registrationOtpAttempts = 0; user.registrationOtpSentAt = new Date(); await user.save(); await sendRegistrationOtp(user, otp);
  } else await user.save();
  return output(user);
}
const otpHash = (email, otp) => crypto.createHmac('sha256', env.jwt.accessSecret).update(`${email}:${otp}`).digest('hex');
async function verifyRegistrationOtp(id, otp) {
  const user = await User.findById(id).select('+registrationOtpHash +registrationOtpExpiresAt +registrationOtpAttempts +registrationOtpSentAt');
  const invalid = () => { throw Object.assign(new Error('Invalid or expired OTP. Request a new code and try again.'), { statusCode: 400 }); };
  if (!user || !user.isActive) throw Object.assign(new Error('User account not found.'), { statusCode: 404 });
  if (user.emailVerified) return output(user);
  if (!/^\d{6}$/.test(String(otp || '')) || !user.registrationOtpHash || !user.registrationOtpExpiresAt || user.registrationOtpExpiresAt.getTime() < Date.now()) return invalid();
  if (user.registrationOtpAttempts >= 5) return invalid();
  const supplied = Buffer.from(otpHash(user.email, String(otp)), 'hex'); const expected = Buffer.from(user.registrationOtpHash, 'hex');
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) { user.registrationOtpAttempts += 1; await user.save(); return invalid(); }
  user.emailVerified = true; user.registrationOtpHash = ''; user.registrationOtpExpiresAt = null; user.registrationOtpAttempts = 0; user.registrationOtpSentAt = null;
  await user.save(); return output(user);
}
async function resendRegistrationOtp(id) {
  const user = await User.findById(id).select('+registrationOtpHash +registrationOtpExpiresAt +registrationOtpAttempts +registrationOtpSentAt');
  if (!user || !user.isActive) throw Object.assign(new Error('User account not found.'), { statusCode: 404 });
  if (user.emailVerified) return output(user);
  if (user.registrationOtpSentAt && Date.now() - user.registrationOtpSentAt.getTime() < 60000) throw Object.assign(new Error('Please wait one minute before requesting another OTP.'), { statusCode: 429 });
  const otp = String(crypto.randomInt(100000, 1000000)); user.registrationOtpHash = otpHash(user.email, otp); user.registrationOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); user.registrationOtpAttempts = 0; user.registrationOtpSentAt = new Date(); await user.save(); await sendRegistrationOtp(user, otp); return output(user);
}
function validDocument(file) {
  if (!file?.buffer?.length) return false;
  if (file.mimetype === 'application/pdf') return file.buffer.subarray(0, 5).toString() === '%PDF-';
  if (file.mimetype === 'image/jpeg') return file.buffer[0] === 0xff && file.buffer[1] === 0xd8;
  if (file.mimetype === 'image/png') return file.buffer.subarray(1, 4).toString() === 'PNG';
  if (file.mimetype === 'image/webp') return file.buffer.subarray(0, 4).toString() === 'RIFF' && file.buffer.subarray(8, 12).toString() === 'WEBP';
  return false;
}
async function uploadIdentityDocument(id, file) {
  if (!validDocument(file)) throw Object.assign(new Error('The selected file is not a valid identity document.'), { statusCode: 400 });
  const user = await User.findById(id).select('+identityDocumentPublicId +identityDocumentResourceType');
  if (!user || !user.isActive) throw Object.assign(new Error('User account not found.'), { statusCode: 404 });
  if (!user.emailVerified) throw Object.assign(new Error('Verify your email before uploading an identity document.'), { statusCode: 403 });
  const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';
  const uploaded = await uploadBuffer(file.buffer, { folder: 'testbook/identity-documents', resource_type: resourceType, public_id: `user-${user._id}-${crypto.randomUUID()}` });
  const old = { id: user.identityDocumentPublicId, type: user.identityDocumentResourceType };
  user.identityDocumentUrl = uploaded.secure_url; user.identityDocumentPublicId = uploaded.public_id; user.identityDocumentResourceType = resourceType; user.identityDocumentName = file.originalname.slice(0, 180); user.identityVerificationStatus = 'pending'; user.identityVerificationNote = ''; user.identitySubmittedAt = new Date(); user.identityVerifiedAt = null; user.identityVerifiedBy = null;
  await user.save();
  if (old.id) destroy(old.id, old.type || 'image').catch(() => undefined);
  return output(user);
}
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
module.exports = { register, login, me, refresh, changePassword, updateProfile, forgotPassword, resetPassword, verifyRegistrationOtp, resendRegistrationOtp, uploadIdentityDocument };
