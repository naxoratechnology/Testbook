const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

const requiredEnv = [
  'MONGODB_URI',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

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
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    email: process.env.SMTP_EMAIL || '',
    password: process.env.SMTP_PASSWORD || '',
    fromName: process.env.SMTP_FROM_NAME || 'Chandrabhaga Academy',
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL || '',
    replyTo: process.env.SMTP_REPLY_TO || process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL || '',
  },
};

module.exports = env;
