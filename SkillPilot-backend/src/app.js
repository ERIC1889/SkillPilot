const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const ApiError = require('./utils/ApiError');

const app = express();

// 1. Security headers
app.use(helmet());

// 2. CORS
app.use(cors({ origin: config.corsOrigin, credentials: true }));

// 3. Body parsing
app.use(express.json());

// 4. Request logging (dev only)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// 5. API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 6. 404 handler
app.use((req, res, next) => {
  next(ApiError.notFound(`${req.method} ${req.originalUrl} 경로를 찾을 수 없습니다`));
});

// 7. Global error handler
app.use(errorHandler);

module.exports = app;
