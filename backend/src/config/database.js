const mongoose = require('mongoose');

async function connectDatabase() {
  try {
    const uri = process.env.MONGODB_URI?.trim();

    const databaseName =
      process.env.MONGODB_DB_NAME?.trim() || 'testbook';

    if (!uri) {
      throw new Error(
        'MONGODB_URI is not configured.'
      );
    }

    if (
      !uri.startsWith('mongodb://') &&
      !uri.startsWith('mongodb+srv://')
    ) {
      throw new Error(
        'MONGODB_URI must begin with mongodb:// or mongodb+srv://.'
      );
    }

    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connection established');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('error', (error) => {
      console.error(
        '❌ MongoDB connection error:',
        error.message
      );
    });

    await mongoose.connect(uri, {
      dbName: databaseName,

      serverSelectionTimeoutMS: 15000,

      socketTimeoutMS: 45000,

      maxPoolSize: 10,

      minPoolSize: 1,

      retryWrites: true,
    });

    console.log(
      `📦 MongoDB database: ${mongoose.connection.name}`
    );

    console.log(
      `🖥️ MongoDB host: ${mongoose.connection.host}`
    );
  } catch (error) {
    console.error(
      `❌ MongoDB startup failed: ${error.message}`
    );

    throw error;
  }
}

async function disconnectDatabase() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('👋 MongoDB connection closed');
    }
  } catch (error) {
    console.error(
      '❌ Error closing MongoDB connection:',
      error.message
    );
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
};