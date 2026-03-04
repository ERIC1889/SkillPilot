const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

const Profile = sequelize.define('Profile', {
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
  job: {
    type: DataTypes.ENUM('고등학생', '대학생', '취업준비생', '직장인', '이직준비생', '기타'),
    allowNull: false,
  },
  grade: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  major: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  interest: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'profiles',
});

module.exports = Profile;
