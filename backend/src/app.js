const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./modules/auth/auth.routes');
const courseRoutes = require('./modules/course/course.routes');
const testSeriesRoutes = require('./modules/testSeries/testSeries.routes');
const notesRoutes = require('./modules/notes/notes.routes');
const currentAffairsRoutes = require('./modules/currentAffairs/currentAffairs.routes');
const syllabusRoutes = require('./modules/syllabus/syllabus.routes');
const previousPaperRoutes = require('./modules/previousPaper/previousPaper.routes');
const noticeRoutes = require('./modules/notices/notice.routes');
const studentRoutes = require('./modules/student/student.routes');
const settingsRoutes = require('./modules/settings/settings.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const notificationRoutes = require('./modules/notification/notification.routes');
const bookmarkRoutes = require('./modules/bookmark/bookmark.routes');
const questionReviewRoutes = require('./modules/questionReview/questionReview.routes');
const bannerRoutes = require('./modules/banner/banner.routes');
const env = require('./config/env');
const app = express();
app.set('trust proxy', 1);

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

const corsOptions = {
  origin(origin, callback) {
    if (!origin || env.cors.origins.includes(origin.replace(/\/$/, ''))) return callback(null, true);
    return callback(Object.assign(new Error(`Origin ${origin} is not allowed by CORS.`), { statusCode: 403 }));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

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

app.use('/api/v1/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/test-series', testSeriesRoutes);
app.use('/api/v1/notes', notesRoutes);
app.use('/api/v1/current-affairs', currentAffairsRoutes);
app.use('/api/v1/syllabus', syllabusRoutes);
app.use('/api/v1/previous-papers', previousPaperRoutes);
app.use('/api/v1/notices', noticeRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/bookmarks', bookmarkRoutes);
app.use('/api/v1/question-review', questionReviewRoutes);
app.use('/api/v1/banners', bannerRoutes);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get('/', (_request, response) => {
  response
    .status(200)
    .type('html')
    .send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Testbook API</title>
    <style>
      body { margin: 0; background: #fff; color: #0f172a; font: 16px Georgia, serif; }
      main { display: flex; align-items: center; gap: 6px; padding: 10px 12px; }
      span { font-size: 18px; }
    </style>
  </head>
  <body>
    <main><span aria-hidden="true"></span><span>Testbook API Running...</span></main>
  </body>
</html>`);
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
