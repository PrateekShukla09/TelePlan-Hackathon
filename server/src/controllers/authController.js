const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { AppError } = require('../utils/errors');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new AppError('Username and password are required', 400, 'VALIDATION_ERROR'));
    }

    const isUsernameMatch = username === env.ADMIN_USERNAME;

    let isPasswordMatch = false;
    if (env.ADMIN_PASSWORD.startsWith('$2a$') || env.ADMIN_PASSWORD.startsWith('$2b$')) {
      isPasswordMatch = await bcrypt.compare(password, env.ADMIN_PASSWORD);
    } else {
      isPasswordMatch = password === env.ADMIN_PASSWORD;
    }

    if (!isUsernameMatch || !isPasswordMatch) {
      return next(new AppError('Invalid credentials', 401, 'UNAUTHORIZED'));
    }

    const token = jwt.sign(
      { username: env.ADMIN_USERNAME, role: 'admin' },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login
};
