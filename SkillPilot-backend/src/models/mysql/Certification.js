const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');

const Certification = sequelize.define('Certification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(150),
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
  // 자격증 설명 (data.go.kr description 등)
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // 응시 자격/요건
  eligibility: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // 발급/주관 기관
  issuer: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  // 최근 합격률(%) 평균
  pass_rate: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  // 시험 과목 목록(JSON array of {name, questionCount, duration})
  subjects: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  popularity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // 데이터 출처: 'data.go.kr', 'manual', 'seed'
  source: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'manual',
  },
  // 외부 시스템 식별자 (data.go.kr 종목코드 등)
  external_code: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  // 어느 공공데이터 API에서 왔는지
  external_source_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  // 마지막 동기화 시각
  synced_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'certifications',
  indexes: [
    { fields: ['external_code', 'external_source_id'], unique: false },
    { fields: ['title'] },
  ],
});

module.exports = Certification;
