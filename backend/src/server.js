const path = require('path');
const dns = require('dns');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

// Force Node.js DNS to use public DNS
dns.setServers([
  '8.8.8.8',
  '1.1.1.1',
]);

console.log('🌐 Node DNS servers:', dns.getServers());

const app = require('./app');

const {
  connectDatabase,
  disconnectDatabase,
} = require('./config/database');

const PORT = Number(process.env.PORT) || 5000;

let server;

const startServer = async () => {
  try {
    await connectDatabase();

    server = app.listen(PORT, () => {
      console.log('');
      console.log('==========================================');
      console.log('🚀 Testbook API Server Started');
      console.log(`🌐 http://localhost:${PORT}`);
      console.log(`❤️  http://localhost:${PORT}/api/health`);
      console.log(`📦 Environment: ${process.env.NODE_ENV}`);
      console.log('==========================================');
      console.log('');
    });
  } catch (error) {
    console.error(
      `❌ Server startup failed: ${error.message}`
    );

    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log('');
  console.log(`🛑 ${signal} received. Shutting down...`);

  if (server) {
    console.log('Closing HTTP server...');

    await new Promise((resolve) => {
      server.close(resolve);
    });
  }

  await disconnectDatabase();

  console.log('Shutdown complete.');

  process.exit(0);
};

process.on('SIGINT', () => {
  shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);

  shutdown('uncaughtException');
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);

  shutdown('unhandledRejection');
});

startServer();