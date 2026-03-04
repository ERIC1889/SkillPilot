const mongoose = require('mongoose');
const config = require('./index');

const connectMongoDB = async () => {
  await mongoose.connect(config.mongodbUri, {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
  });
  console.log('MongoDB connected successfully');
};

module.exports = connectMongoDB;
