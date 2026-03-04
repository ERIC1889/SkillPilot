const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(
  config.mysql.database,
  config.mysql.user,
  config.mysql.password,
  {
    host: config.mysql.host,
    port: config.mysql.port,
    dialect: 'mysql',
    logging: config.nodeEnv === 'development' ? console.log : false,
    define: {
      underscored: true,
      timestamps: true,
    },
  }
);

module.exports = sequelize;
