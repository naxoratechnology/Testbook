const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./auth.model');
const env = require('../../config/env');
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
module.exports = { register, login, me };
