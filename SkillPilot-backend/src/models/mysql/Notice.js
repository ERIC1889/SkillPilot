const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

const Notice = sequelize.define('Notice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.ENUM('공지사항', '학습 팁', '업데이트', '이벤트'),
    allowNull: false,
    defaultValue: '공지사항',
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  icon: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'notices',
});

module.exports = Notice;
