const path = require('path');
const dns = require('dns');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dns.setServers(['8.8.8.8', '1.1.1.1']);

const { connectDatabase, disconnectDatabase } = require('../config/database');
const User = require('../modules/auth/auth.model');

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(name + ' is required in backend/.env');
  return value;
}

async function seedAdmin() {
  const name = required('ADMIN_NAME');
  const email = required('ADMIN_EMAIL').toLowerCase();
  const password = required('ADMIN_PASSWORD');
  const mobile = process.env.ADMIN_MOBILE?.trim() || '';

  if (password.length < 8) throw new Error('ADMIN_PASSWORD must contain at least 8 characters');

  await connectDatabase();
  const existing = await User.findOne({ email }).select('+password');

  if (existing) {
    existing.name = name;
    existing.mobile = mobile;
    existing.role = 'admin';
    existing.isActive = true;

    if (process.argv.includes('--reset-password')) {
      existing.password = await bcrypt.hash(password, 12);
    }

    await existing.save();
    console.log('Admin account updated: ' + email);
    if (!process.argv.includes('--reset-password')) {
      console.log('Existing password preserved. Use --reset-password to replace it.');
    }
    return;
  }

  await User.create({
    name,
    email,
    mobile,
    password: await bcrypt.hash(password, 12),
    role: 'admin',
    targetExam: '—',
    isActive: true,
  });

  console.log('Admin account created: ' + email);
}

seedAdmin()
  .catch((error) => {
    console.error('Admin seeder failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
