const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

const Notice = sequelize.define('Notice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.ENUM('공지', '업데이트', '이벤트'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'notices',
});

module.exports = Notice;
