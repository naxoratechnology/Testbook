const mongoose = require('mongoose');
let listenersAttached = false;

// Never queue API queries while MongoDB is unavailable. The API readiness
// middleware returns a fast 503 response instead of a model-specific timeout.
mongoose.set('bufferCommands', false);

async function dnsOverHttps(name, type) {
  const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`, {
    headers: { accept: 'application/dns-json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`DNS lookup failed with status ${response.status}.`);
  const payload = await response.json();
  if (payload.Status !== 0 || !Array.isArray(payload.Answer)) throw new Error(`DNS lookup failed for ${name}.`);
  return payload.Answer.map((answer) => answer.data);
}

async function resolveSrvFallback(uri) {
  const match = uri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/i);
  if (!match) throw new Error('MONGODB_URI has an invalid mongodb+srv format.');
  const [, credentials, hostname, pathname = '/', rawQuery = ''] = match;
  const [srvAnswers, txtAnswers] = await Promise.all([
    dnsOverHttps(`_mongodb._tcp.${hostname}`, 'SRV'),
    dnsOverHttps(hostname, 'TXT').catch(() => []),
  ]);
  const hosts = srvAnswers.map((answer) => {
    const parts = answer.trim().split(/\s+/);
    return `${parts[3].replace(/\.$/, '')}:${parts[2]}`;
  }).filter((host) => !host.includes('undefined'));
  if (!hosts.length) throw new Error(`No MongoDB hosts were found for ${hostname}.`);
  const txtQuery = txtAnswers.join('').replace(/^"|"$/g, '').replace(/"\s*"/g, '');
  const query = [txtQuery, rawQuery.replace(/^\?/, ''), 'tls=true'].filter(Boolean).join('&');
  return `mongodb://${credentials}@${hosts.join(',')}${pathname}?${query}`;
}

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

    if (!listenersAttached) {
      mongoose.connection.on('connected', () => console.log('MongoDB connection established'));
      mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));
      mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
      mongoose.connection.on('error', (error) => console.error('MongoDB connection error:', error.message));
      listenersAttached = true;
    }

    const options = {
      dbName: databaseName,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
    };
    try {
      await mongoose.connect(uri, options);
    } catch (error) {
      const srvLookupFailed = uri.startsWith('mongodb+srv://') && /querySrv|ETIMEOUT|ECONNREFUSED|ENOTFOUND/i.test(error.message);
      if (!srvLookupFailed) throw error;
      console.warn('MongoDB SRV lookup failed. Retrying through DNS-over-HTTPS.');
      await mongoose.connect(await resolveSrvFallback(uri), options);
    }

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

function requireDatabase(_request, response, next) {
  if (mongoose.connection.readyState === 1) return next();
  return response.status(503).json({
    success: false,
    message: 'Database is temporarily unavailable. Please try again shortly.',
  });
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  requireDatabase,
};
