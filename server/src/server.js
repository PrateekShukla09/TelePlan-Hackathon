const http = require('http');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

const server = http.createServer(app);

const startServer = async () => {
  await connectDB();
  server.listen(env.PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Tariff Recommender Backend Running on Port ${env.PORT}`);
    console.log(`📝 Environment: ${env.NODE_ENV}`);
    console.log(`📚 Swagger Docs: http://localhost:${env.PORT}/api-docs`);
    console.log(`==================================================`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { server, app };
