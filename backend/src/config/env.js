const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
  override: true,
});

const requiredEnv = [
  'MONGODB_URI',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const cleanEnvValue = (value) => {
  const text = String(value || '').trim();
  return /^(['"]).*\1$/.test(text) ? text.slice(1, -1).trim() : text;
};
const smtpHost = cleanEnvValue(process.env.SMTP_HOST || 'smtp.gmail.com');
const smtpPassword = cleanEnvValue(process.env.SMTP_PASSWORD);
const smtpEmail = cleanEnvValue(process.env.SMTP_EMAIL);
// SMTP_EMAIL remains the primary login setting. SMTP_USER is only a fallback
// for deployments that intentionally omit SMTP_EMAIL.
const smtpUser = smtpEmail || cleanEnvValue(process.env.SMTP_USER);
const smtpFromEmail = cleanEnvValue(process.env.SMTP_FROM_EMAIL || smtpEmail);
const smtpReplyTo = cleanEnvValue(process.env.SMTP_REPLY_TO || smtpFromEmail || smtpEmail);

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',

  port: Number(process.env.PORT) || 5000,

  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME || 'testbook',
  },

  cors: {
    origins: [...new Set([
      ...(process.env.CLIENT_ORIGIN || '').split(','),
      'https://chandrabhagaacademy.com',
      'https://www.chandrabhagaacademy.com',
      ...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173']),
    ].map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean))],
  },

  publicWebUrl: (process.env.PUBLIC_WEB_URL || process.env.CLIENT_ORIGIN || 'https://www.chandrabhagaacademy.com').split(',')[0].trim().replace(/\/$/, ''),

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'development-access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'development-refresh-secret-change-me',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '1d',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  smtp: {
    host: smtpHost,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    email: smtpEmail,
    user: smtpUser,
    // Google displays app passwords in four groups. Spaces are only visual
    // separators and cause Gmail to reject SMTP authentication if sent.
    password: /(^|\.)gmail\.com$/i.test(smtpHost) ? smtpPassword.replace(/\s+/g, '') : smtpPassword,
    fromName: process.env.SMTP_FROM_NAME || 'Chandrabhaga Academy',
    fromEmail: smtpFromEmail,
    replyTo: smtpReplyTo,
  },
};

module.exports = env;
