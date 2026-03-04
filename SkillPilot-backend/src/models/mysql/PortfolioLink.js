const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

const PortfolioLink = sequelize.define('PortfolioLink', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  portfolio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
}, {
  tableName: 'portfolio_links',
});

module.exports = PortfolioLink;
