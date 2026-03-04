const openai = require('../config/openai');
const config = require('../config');
const AIAnalysis = require('../models/mongodb/AIAnalysis');

const callGPT = async (messages) => {
  const response = await openai.chat.completions.create({
    model: config.openai.model,
    messages,
    temperature: 0.7,
  });

  return {
    content: response.choices[0].message.content,
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

module.exports = { recommendCertifications, generateRoadmap, analyzeWrongAnswer };
