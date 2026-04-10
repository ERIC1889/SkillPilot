/**
 * 수동 자격증 동기화 스크립트
 * 사용: npm run sync:certifications
 */

require('dotenv').config();
const { sequelize } = require('../models/mysql');
const { syncCertifications } = require('../services/certificationSync.service');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected');
    await sequelize.sync({ alter: true });

    const result = await syncCertifications();
    console.log('결과:', result);
    process.exit(0);
  } catch (err) {
    console.error('동기화 실패:', err);
    process.exit(1);
  }
})();
