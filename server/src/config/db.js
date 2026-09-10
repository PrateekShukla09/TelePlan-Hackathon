const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    if (env.NODE_ENV !== 'test') {
      console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    }
    return conn;
  } catch (error) {
    if (env.NODE_ENV !== 'test') {
      console.error(`[Database Error] ${error.message}`);
    }
    if (env.NODE_ENV === 'test') {
      throw error;
    }
    console.warn('[Database Warning] Failed to connect to MongoDB. Ensure MongoDB is running or configure MONGODB_URI.');
  }
};

module.exports = connectDB;
