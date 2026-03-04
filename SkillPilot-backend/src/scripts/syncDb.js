require('dotenv').config();
const { sequelize } = require('../models/mysql');

const sync = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected');

    // alter: true will add missing columns without dropping existing data
    await sequelize.sync({ alter: true });
    console.log('All MySQL tables synchronized successfully');

    process.exit(0);
  } catch (error) {
    console.error('DB sync failed:', error);
    process.exit(1);
  }
};

sync();
