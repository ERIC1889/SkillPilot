const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

const ExamSchedule = sequelize.define('ExamSchedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  certification_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  exam_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  registration_start: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  registration_end: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'exam_schedules',
});

module.exports = ExamSchedule;
