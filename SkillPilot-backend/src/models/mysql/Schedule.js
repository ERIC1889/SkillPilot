const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  goal: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  amount: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  event: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('예정', '완료', '취소'),
    defaultValue: '예정',
  },
}, {
  tableName: 'schedules',
});

module.exports = Schedule;
