const rateLimit = require('express-rate-limit');
const { AppError } = require('../utils/errors');

const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Too many requests from this IP, please try again later.', 429, 'RATE_LIMIT_EXCEEDED'));
  }
});

const recommendationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // max 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Recommendation rate limit exceeded. Please wait a moment before trying again.', 429, 'RATE_LIMIT_EXCEEDED'));
  }
});

module.exports = {
  defaultLimiter,
  recommendationLimiter
};
