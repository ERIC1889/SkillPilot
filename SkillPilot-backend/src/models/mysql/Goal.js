const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

const Goal = sequelize.define('Goal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tech_stack: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  target_roles: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  custom_role: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  period: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'goals',
});

module.exports = Goal;
