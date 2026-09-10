const { AppError } = require('../utils/errors');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[property]);
    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', formattedErrors));
    }
    req[property] = result.data;
    next();
  };
};

module.exports = validate;
