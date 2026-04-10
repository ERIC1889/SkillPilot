/**
 * 문제은행 AI 생성 스크립트
 *
 * 사용:
 *   npm run generate:questions                  # 모든 자격증에 과목당 기본 수량 보충
 *   node src/scripts/generateQuestions.js --cert 1 --per 20
 */

require('dotenv').config();
const { sequelize } = require('../models/mysql');
const connectMongoDB = require('../config/mongodb');
const {
  ensureQuestionsForAll,
  ensureQuestionsForCertification,
} = require('../services/questionBank.service');

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--cert') out.certId = Number(args[++i]);
    else if (a === '--per') out.per = Number(args[++i]);
  }
  return out;
};

(async () => {
  try {
    const { certId, per } = parseArgs();

    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    await connectMongoDB();

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY 가 설정되지 않았습니다.');
      process.exit(1);
    }

    let result;
    if (certId) {
      result = await ensureQuestionsForCertification(certId, per || 15);
    } else {
      result = await ensureQuestionsForAll(per || 15);
    }
    console.log('\n결과:', JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('생성 실패:', err);
    process.exit(1);
  }
})();
