const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

const PortfolioProject = sequelize.define('PortfolioProject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  portfolio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  tag: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'portfolio_projects',
});

module.exports = PortfolioProject;
