const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const env = require('./config/env');
const app = express();

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(helmet());

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: env.cors.origins,
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| Body Parsing
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: '2mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '2mb',
  })
);

/*
|--------------------------------------------------------------------------
| Cookies
|--------------------------------------------------------------------------
*/

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Logging
|--------------------------------------------------------------------------
*/

app.use(
  morgan(
    env.nodeEnv === 'production'
      ? 'combined'
      : 'dev'
  )
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get('/api/health', (_request, response) => {
  const database =
    mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected';

  response.status(
    database === 'connected' ? 200 : 503
  ).json({
    success: database === 'connected',
    service: 'Testbook API',
    database,
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Routes will be added here.
//
// Example:
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/courses', courseRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((_request, response) => {
  response.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(
  (error, _request, response, _next) => {
    console.error(error);

    const statusCode = error.statusCode || 500;

    response.status(statusCode).json({
      success: false,
      message:
        env.nodeEnv === 'production'
          ? 'Internal server error'
          : error.message,
    });
  }
);

module.exports = app;