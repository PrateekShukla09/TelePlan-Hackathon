const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const setupSwagger = require('./config/swagger');
const { defaultLimiter } = require('./middleware/rateLimiter');
const { errorHandler, AppError } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || env.NODE_ENV === 'development' || origin === env.CLIENT_URL || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

// HTTP Request logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Rate limiting
app.use('/api', defaultLimiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Setup Swagger UI Documentation
setupSwagger(app);

// Mount API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/recommendations', require('./routes/recommendations'));

// 404 Handler
app.use('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND'));
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
