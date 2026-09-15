const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function register(body = {}) {
  const value = { name: String(body.name || '').trim(), email: String(body.email || '').trim().toLowerCase(), mobile: String(body.mobile || '').trim(), password: String(body.password || '') };
  const errors = {};
  if (value.name.length < 2 || value.name.length > 80) errors.name = 'Name must be 2-80 characters.';
  if (!email.test(value.email)) errors.email = 'Enter a valid email.';
  if (!/^\+?[0-9\s-]{10,20}$/.test(value.mobile)) errors.mobile = 'Enter a valid mobile number.';
  if (value.password.length < 8 || value.password.length > 72) errors.password = 'Password must be 8-72 characters.';
  return { value, errors };
}
function login(body = {}) {
  const value = { identifier: String(body.identifier || body.emailOrMobile || '').trim(), password: String(body.password || '') };
  const errors = {};
  if (!value.identifier) errors.identifier = 'Email or mobile is required.';
  if (!value.password) errors.password = 'Password is required.';
  return { value, errors };
}
function changePassword(body = {}) {
  const value = { currentPassword: String(body.currentPassword || ''), newPassword: String(body.newPassword || '') };
  const errors = {};
  if (!value.currentPassword) errors.currentPassword = 'Current password is required.';
  if (value.newPassword.length < 8 || value.newPassword.length > 72) errors.newPassword = 'New password must be 8-72 characters.';
  if (value.currentPassword && value.currentPassword === value.newPassword) errors.newPassword = 'New password must be different from the current password.';
  return { value, errors };
}
module.exports = { register, login, changePassword };
