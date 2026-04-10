const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

/**
 * 채용 공고 (내부 시드 또는 수동 등록)
 *
 * 원티드/사람인 등 외부 플랫폼 공식 API 제한으로 인해
 * MVP 는 내부 DB 에 저장된 공고만 제공합니다.
 */
const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  employment_type: {
    type: DataTypes.STRING(50),
    allowNull: true, // 정규직/계약직/인턴
  },
  required_skills: {
    type: DataTypes.JSON,
    allowNull: true, // ["Java", "Spring", ...]
  },
  preferred_certifications: {
    type: DataTypes.JSON,
    allowNull: true, // ["정보처리기사", "AWS SAA", ...]
  },
  role_category: {
    type: DataTypes.STRING(100),
    allowNull: true, // 백엔드, 프론트엔드, 데이터, 보안, 클라우드 등
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  source: {
    type: DataTypes.STRING(50),
    allowNull: true, // 'internal', 'wanted', ...
    defaultValue: 'internal',
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'jobs',
});

module.exports = Job;
