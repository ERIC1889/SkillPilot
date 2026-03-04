const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

const Portfolio = sequelize.define('Portfolio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  etc_content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'portfolios',
});

module.exports = Portfolio;
