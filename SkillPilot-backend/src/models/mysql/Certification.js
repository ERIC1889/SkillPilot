const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

const Certification = sequelize.define('Certification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  level: {
    type: DataTypes.ENUM('국가기술', '국가전문', '민간', '국제'),
    allowNull: false,
  },
  duration: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  jobs: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  exam_info: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tips: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  extra: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  field: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  popularity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'certifications',
});

module.exports = Certification;
