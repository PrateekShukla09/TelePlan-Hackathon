const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected server error occurred';
  let details = err.errors || null;

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = `Invalid ID format: ${err.value}`;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed for database operation';
    details = Object.values(err.errors).map(e => e.message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Invalid token provided';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Token has expired';
  }

  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error('[Unhandled Error]', err);
  }

  res.status(statusCode).json({
    error: {
      message,
      code,
      ...(details ? { details } : {})
    }
  });
};

module.exports = {
  AppError,
  errorHandler
};
