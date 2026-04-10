const openai = require('../config/openai');
const config = require('../config');
const AIAnalysis = require('../models/mongodb/AIAnalysis');

const cleanJSON = (text) => {
  // Remove markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?\s*```$/, '');
  }
  return cleaned.trim();
};

const callGPT = async (messages) => {
  const response = await openai.chat.completions.create({
    model: config.openai.model,
    messages,
  });

  const raw = response.choices[0].message.content;
  return {
    content: cleanJSON(raw),
    tokensUsed: response.usage?.total_tokens || 0,
  };
};

const recommendCertifications = async (userId, profile, goal) => {
  const inputKey = JSON.stringify({ profile, goal });

  // Check cache
  const cached = await AIAnalysis.findOne({
    userId,
    type: 'certification_recommendation',
    input: inputKey,
  }).sort({ createdAt: -1 });

  if (cached) return cached.output;

  const messages = [
    {
      role: 'system',
      content: `당신은 IT 자격증 추천 전문가입니다. 사용자의 프로필과 목표를 기반으로 가장 적합한 IT 자격증 3개를 추천해주세요. JSON 형식으로 응답하세요.`,
    },
    {
      role: 'user',
      content: `프로필: ${JSON.stringify(profile)}\n목표: ${JSON.stringify(goal)}\n\n위 정보를 기반으로 추천 자격증 3개를 다음 JSON 형식으로 응답해주세요:\n[{"title": "자격증명", "reason": "추천 사유", "priority": "높음/보통/낮음"}]`,
    },
  ];

  const result = await callGPT(messages);

  let output;
  try {
    output = JSON.parse(result.content);
  } catch {
    output = result.content;
  }

  await AIAnalysis.create({
    userId,
    type: 'certification_recommendation',
    input: inputKey,
    output,
    model: config.openai.model,
    tokensUsed: result.tokensUsed,
  });

  return output;
};

const generateRoadmap = async (userId, certification, priority, period) => {
  const inputKey = JSON.stringify({ certificationId: certification.id, priority, period });

  const cached = await AIAnalysis.findOne({
    userId,
    type: 'roadmap_generation',
    input: inputKey,
  }).sort({ createdAt: -1 });

  if (cached) return cached.output;

  const messages = [
    {
      role: 'system',
      content: `당신은 IT 자격증 학습 로드맵 전문가입니다. 자격증 정보와 학습 기간을 기반으로 주차별 학습 계획을 생성해주세요. JSON 형식으로 응답하세요.`,
    },
    {
      role: 'user',
      content: `자격증: ${certification.title}\n우선순위: ${priority}\n학습기간: ${period}\n\n다음 JSON 형식으로 주차별 학습 계획을 만들어주세요:\n[{"weekId": "week-1", "title": "1주차: 주제", "goal": "학습 목표", "time": "예상 학습 시간", "materials": ["학습 자료1"], "order": 1}]`,
    },
  ];

  const result = await callGPT(messages);

  let output;
  try {
    output = JSON.parse(result.content);
  } catch {
    output = result.content;
  }

  await AIAnalysis.create({
    userId,
    type: 'roadmap_generation',
    input: inputKey,
    output,
    model: config.openai.model,
    tokensUsed: result.tokensUsed,
  });

  return output;
};

const analyzeWrongAnswer = async (userId, questionData) => {
  const messages = [
    {
      role: 'system',
      content: `당신은 IT 자격증 시험 오답 분석 전문가입니다. 문제와 오답/정답 정보를 분석하여 학습자가 이해할 수 있도록 설명해주세요. JSON 형식으로 응답하세요.`,
    },
    {
      role: 'user',
      content: `문제: ${questionData.question}\n선택한 답: ${questionData.myAnswer}\n정답: ${questionData.correctAnswer}\n\n다음 JSON 형식으로 분석해주세요:\n{"explanation": "왜 정답이 맞는지 설명", "tip": "관련 학습 팁"}`,
    },
  ];

  const result = await callGPT(messages);

  let output;
  try {
    output = JSON.parse(result.content);
  } catch {
    output = { explanation: result.content, tip: '' };
  }

  await AIAnalysis.create({
    userId,
    type: 'wrong_answer_analysis',
    input: questionData,
    output,
    model: config.openai.model,
    tokensUsed: result.tokensUsed,
  });

  return output;
};

/**
 * 자격증 과목 목록을 AI 로 추론
 * subjects 필드(data.go.kr)에 정보가 없을 때 사용
 */
const inferSubjects = async (certification) => {
  const messages = [
    {
      role: 'system',
      content: `당신은 한국 IT 자격증 시험 전문가입니다. 자격증의 표준 시험 과목 목록을 JSON 배열로만 응답하세요.`,
    },
    {
      role: 'user',
      content: `자격증: ${certification.title}\n분야: ${certification.field || '-'}\n\n이 자격증의 대표적인 시험 과목 4~6개를 다음 JSON 형식으로만 응답하세요:\n["과목명1", "과목명2", "과목명3", "과목명4"]`,
    },
  ];

  const result = await callGPT(messages);
  try {
    const parsed = JSON.parse(result.content);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {}
  return [];
};

/**
 * AI 로 특정 자격증/과목의 객관식 문제를 생성
 * @returns {Array<{subject, question, options, correctIndex, difficulty, explanation, tags}>}
 */
const generateQuestions = async ({ certification, subject, count = 10, difficulty }) => {
  const diffText = difficulty ? `\n난이도: ${difficulty}` : '';
  const messages = [
    {
      role: 'system',
      content: `당신은 한국 IT 자격증 문제 출제 전문가입니다. 실제 시험에 출제될 법한 고품질 객관식 문제를 JSON 배열로만 생성하세요. 설명문, 마크다운, 주석 없이 JSON 만 출력하세요.`,
    },
    {
      role: 'user',
      content: `자격증: ${certification.title}
과목: ${subject}${diffText}
문항수: ${count}

다음 규칙을 지켜주세요:
1. 각 문제는 4지선다 (options 길이 4).
2. correctIndex 는 0~3 사이 정수.
3. difficulty 는 "하"/"중"/"상" 중 하나.
4. explanation 은 왜 정답인지 구체적으로.
5. tags 는 주요 키워드 1~3개.
6. 중복/유사 문제 금지.
7. 한국어로 출력.

응답 JSON 스키마:
[
  {
    "subject": "${subject}",
    "question": "문제 내용",
    "options": ["보기1", "보기2", "보기3", "보기4"],
    "correctIndex": 0,
    "difficulty": "중",
    "explanation": "해설",
    "tags": ["키워드1", "키워드2"]
  }
]`,
    },
  ];

  const result = await callGPT(messages);
  let parsed;
  try {
    parsed = JSON.parse(result.content);
  } catch (err) {
    throw new Error(`AI 응답 JSON 파싱 실패: ${err.message}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error('AI 응답이 배열 형식이 아닙니다');
  }

  // 검증 및 정규화
  return parsed
    .filter((q) =>
      q &&
      typeof q.question === 'string' &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      Number.isInteger(q.correctIndex) &&
      q.correctIndex >= 0 && q.correctIndex <= 3
    )
    .map((q) => ({
      subject: q.subject || subject,
      question: String(q.question).trim(),
      options: q.options.map(String),
      correctIndex: q.correctIndex,
      difficulty: ['하', '중', '상'].includes(q.difficulty) ? q.difficulty : '중',
      explanation: q.explanation ? String(q.explanation).trim() : '',
      tags: Array.isArray(q.tags) ? q.tags.map(String).slice(0, 5) : [],
    }));
};

/**
 * AI 기반 모의면접 응답 평가/다음 질문 생성
 */
const mockInterviewTurn = async ({ role, certifications, history, userAnswer }) => {
  const messages = [
    {
      role: 'system',
      content: `당신은 한국 IT 기업 채용 면접관입니다. 지원자의 답변을 평가하고 다음 기술 질문을 제시하세요. JSON 형식으로만 응답하세요.`,
    },
    {
      role: 'user',
      content: `지원 직무: ${role}
보유 자격증: ${(certifications || []).join(', ') || '없음'}
이전 대화: ${JSON.stringify(history || [])}
방금 답변: ${userAnswer || '(첫 질문이라 답변 없음)'}

다음 JSON 형식으로 응답하세요:
{
  "feedback": "직전 답변에 대한 평가 (첫 턴이면 빈 문자열)",
  "score": 0~100 사이 정수 (첫 턴이면 null),
  "nextQuestion": "다음 질문 (면접 종료면 빈 문자열)",
  "done": true/false
}`,
    },
  ];

  const result = await callGPT(messages);
  try {
    return JSON.parse(result.content);
  } catch {
    return { feedback: '', score: null, nextQuestion: result.content, done: false };
  }
};

/**
 * 스킬갭 분석: 목표 직무 대비 현재 상태
 */
const analyzeSkillGap = async ({ targetRole, currentSkills, certifications, projects }) => {
  const messages = [
    {
      role: 'system',
      content: `당신은 IT 커리어 코치입니다. 지원자의 현재 역량과 목표 직무를 비교해 부족한 스킬과 추천 학습 순서를 JSON 으로 제시하세요.`,
    },
    {
      role: 'user',
      content: `목표 직무: ${targetRole}
현재 보유 스킬: ${(currentSkills || []).join(', ') || '없음'}
보유 자격증: ${(certifications || []).join(', ') || '없음'}
수행 프로젝트: ${(projects || []).join(', ') || '없음'}

다음 JSON 형식으로 응답하세요:
{
  "matchScore": 0~100,
  "strengths": ["강점1", "강점2"],
  "gaps": [{"skill": "부족한 스킬", "priority": "높음/보통/낮음", "reason": "이유"}],
  "recommendedCertifications": ["자격증1", "자격증2"],
  "recommendedProjects": ["프로젝트 아이디어1"],
  "nextSteps": ["할일1", "할일2"]
}`,
    },
  ];

  const result = await callGPT(messages);
  try {
    return JSON.parse(result.content);
  } catch {
    return { matchScore: null, strengths: [], gaps: [], recommendedCertifications: [], recommendedProjects: [], nextSteps: [], raw: result.content };
  }
};

module.exports = {
  recommendCertifications,
  generateRoadmap,
  analyzeWrongAnswer,
  inferSubjects,
  generateQuestions,
  mockInterviewTurn,
  analyzeSkillGap,
};
