const path = require('path');
const dns = require('dns');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Atlas SRV records require a resolver that supports external DNS queries.
dns.setServers(['8.8.8.8', '1.1.1.1']);


const app = require('./app');
const env = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/database');

let server;

async function startServer() {
  server = app.listen(env.port, () => {
      console.log('Testbook API server running on http://localhost:' + env.port);
      console.log('Environment: ' + env.nodeEnv);
  });

  const connectWithRetry = async () => {
    try {
      await connectDatabase();
    } catch (error) {
      console.error('MongoDB unavailable. Retrying in 10 seconds:', error.message);
      setTimeout(connectWithRetry, 10000);
    }
  };

  await connectWithRetry();
}

async function shutdown(signal) {
  console.log(signal + ' received. Shutting down...');
  if (server) await new Promise((resolve) => server.close(resolve));
  await disconnectDatabase();
  process.exit(0);
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

startServer();
