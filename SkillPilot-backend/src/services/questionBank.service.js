/**
 * 문제은행 서비스
 *
 * 주어진 자격증에 문제가 없거나 부족할 경우 AI 로 생성해 MongoDB 에 저장합니다.
 */

const { Certification } = require('../models/mysql');
const Question = require('../models/mongodb/Question');
const aiService = require('./ai.service');

const log = (...args) => console.log('[questionBank]', ...args);
const warn = (...args) => console.warn('[questionBank]', ...args);

const DEFAULT_PER_SUBJECT = 15;

/**
 * 자격증의 과목 목록을 결정한다.
 * - Certification.subjects(JSON) 가 있으면 그걸 사용
 * - 없으면 AI 로 추론
 */
const resolveSubjects = async (certification) => {
  const raw = certification.subjects;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .map((s) => (typeof s === 'string' ? s : s?.name))
      .filter(Boolean);
  }

  try {
    const inferred = await aiService.inferSubjects(certification.toJSON ? certification.toJSON() : certification);
    return inferred.length > 0 ? inferred : ['일반'];
  } catch (err) {
    warn(`과목 추론 실패 [${certification.title}]: ${err.message}`);
    return ['일반'];
  }
};

/**
 * 특정 자격증의 문제가 목표 수량(per subject)만큼 생성되도록 보충
 */
const ensureQuestionsForCertification = async (certificationId, perSubject = DEFAULT_PER_SUBJECT) => {
  const cert = await Certification.findByPk(certificationId);
  if (!cert) {
    throw new Error(`Certification ${certificationId} not found`);
  }

  const subjects = await resolveSubjects(cert);
  log(`[${cert.title}] 과목: ${subjects.join(', ')}`);

  let totalCreated = 0;
  for (const subject of subjects) {
    const existingCount = await Question.countDocuments({
      certificationId: cert.id,
      subject,
    });

    const need = Math.max(0, perSubject - existingCount);
    if (need === 0) {
      log(`  · ${subject}: 이미 ${existingCount}문항 (스킵)`);
      continue;
    }

    try {
      log(`  · ${subject}: ${existingCount} → ${perSubject} (${need}문항 생성)`);
      const generated = await aiService.generateQuestions({
        certification: cert.toJSON(),
        subject,
        count: need,
      });

      if (generated.length === 0) {
        warn(`  · ${subject}: AI 응답이 비어있음`);
        continue;
      }

      const docs = generated.map((q) => ({
        certificationId: cert.id,
        subject: q.subject,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        difficulty: q.difficulty,
        explanation: q.explanation,
        tags: q.tags,
      }));

      await Question.insertMany(docs, { ordered: false });
      totalCreated += docs.length;
    } catch (err) {
      warn(`  · ${subject} 생성 실패: ${err.message}`);
    }
  }

  return { certification: cert.title, totalCreated };
};

/**
 * 모든 자격증에 대해 문제 보충
 */
const ensureQuestionsForAll = async (perSubject = DEFAULT_PER_SUBJECT) => {
  const certs = await Certification.findAll();
  const summary = [];
  for (const cert of certs) {
    try {
      const result = await ensureQuestionsForCertification(cert.id, perSubject);
      summary.push(result);
    } catch (err) {
      warn(`[${cert.title}] 실패: ${err.message}`);
      summary.push({ certification: cert.title, error: err.message });
    }
  }
  return summary;
};

module.exports = {
  resolveSubjects,
  ensureQuestionsForCertification,
  ensureQuestionsForAll,
};
