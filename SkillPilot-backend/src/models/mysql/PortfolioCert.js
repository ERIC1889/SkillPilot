const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

const PortfolioCert = sequelize.define('PortfolioCert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  portfolio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cert_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  year: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
}, {
  tableName: 'portfolio_certs',
});

module.exports = PortfolioCert;
