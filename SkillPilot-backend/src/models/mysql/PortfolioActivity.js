const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

const PortfolioActivity = sequelize.define('PortfolioActivity', {
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
  year: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('대외활동', '봉사활동', '수상', '교육', '기타'),
    defaultValue: '기타',
  },
}, {
  tableName: 'portfolio_activities',
});

module.exports = PortfolioActivity;
