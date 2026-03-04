const app = require('./app');
const config = require('./config');
const { sequelize } = require('./models/mysql');
const connectMongoDB = require('./config/mongodb');

const start = async () => {
  try {
    // MySQL connection
    await sequelize.authenticate();
    console.log('MySQL connected successfully');

    // MongoDB connection (optional - app works without it)
    try {
      await connectMongoDB();
    } catch (mongoErr) {
      console.warn('MongoDB connection failed (CBT/Roadmap features will be limited):', mongoErr.message);
    }

    // Start server
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
