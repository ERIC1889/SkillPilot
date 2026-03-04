const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

const UserCertification = sequelize.define('UserCertification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  certification_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('준비중', '취득완료', '미응시'),
    defaultValue: '준비중',
  },
}, {
  tableName: 'user_certifications',
});

module.exports = UserCertification;
