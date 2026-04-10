const MockInterviewSession = require('../models/mongodb/MockInterviewSession');
const { UserCertification } = require('../models/mysql');
const aiService = require('./ai.service');
const ApiError = require('../utils/ApiError');

const MAX_TURNS = 10;

const buildHistory = (turns) =>
  turns.map((t) => ({ role: t.role, text: t.text }));

/**
 * 모의면접 시작: 첫 질문 생성
 */
const start = async (userId, { role }) => {
  if (!role) throw ApiError.badRequest('지원 직무가 필요합니다');

  // 사용자 보유 자격증 조회
  const userCerts = await UserCertification.findAll({
    where: { user_id: userId },
    include: [{ association: 'certification' }],
  });
  const certTitles = userCerts.map((uc) => uc.certification?.title).filter(Boolean);

  // AI 첫 질문 생성
  const ai = await aiService.mockInterviewTurn({
    role,
    certifications: certTitles,
    history: [],
    userAnswer: '',
  });

  const firstQuestion = ai.nextQuestion || '자기소개 부탁드립니다.';

  const session = await MockInterviewSession.create({
    userId,
    role,
    certifications: certTitles,
    turns: [{ role: 'interviewer', text: firstQuestion }],
    done: false,
  });

  return {
    sessionId: session._id.toString(),
    role: session.role,
    firstQuestion,
  };
};

/**
 * 답변 제출: 피드백 + 다음 질문 생성
 */
const answer = async (userId, sessionId, { answer: userAnswer }) => {
  if (!userAnswer || !String(userAnswer).trim()) {
    throw ApiError.badRequest('답변 내용이 필요합니다');
  }

  const session = await MockInterviewSession.findOne({ _id: sessionId, userId });
  if (!session) throw ApiError.notFound('면접 세션을 찾을 수 없습니다');
  if (session.done) throw ApiError.badRequest('이미 종료된 세션입니다');

  session.turns.push({ role: 'candidate', text: userAnswer });

  const interviewerTurnCount = session.turns.filter((t) => t.role === 'interviewer').length;
  const shouldEnd = interviewerTurnCount >= MAX_TURNS;

  const ai = await aiService.mockInterviewTurn({
    role: session.role,
    certifications: session.certifications,
    history: buildHistory(session.turns),
    userAnswer,
  });

  if (ai.feedback) {
    session.turns.push({
      role: 'feedback',
      text: ai.feedback,
      score: typeof ai.score === 'number' ? ai.score : null,
    });
  }

  let nextQuestion = '';
  let done = ai.done === true || shouldEnd;

  if (!done && ai.nextQuestion) {
    session.turns.push({ role: 'interviewer', text: ai.nextQuestion });
    nextQuestion = ai.nextQuestion;
  } else {
    done = true;
    // 총점 계산: feedback 턴의 score 평균
    const scores = session.turns
      .filter((t) => t.role === 'feedback' && typeof t.score === 'number')
      .map((t) => t.score);
    if (scores.length > 0) {
      session.totalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
  }

  session.done = done;
  await session.save();

  return {
    feedback: ai.feedback || '',
    score: typeof ai.score === 'number' ? ai.score : null,
    nextQuestion,
    done,
    totalScore: session.totalScore,
  };
};

const getSession = async (userId, sessionId) => {
  const session = await MockInterviewSession.findOne({ _id: sessionId, userId });
  if (!session) throw ApiError.notFound('면접 세션을 찾을 수 없습니다');
  return session;
};

const listSessions = async (userId) => {
  return MockInterviewSession.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20);
};

module.exports = { start, answer, getSession, listSessions };
