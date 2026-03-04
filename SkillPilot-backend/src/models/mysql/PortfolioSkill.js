const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

const PortfolioSkill = sequelize.define('PortfolioSkill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  portfolio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  skill_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'portfolio_skills',
});

module.exports = PortfolioSkill;
