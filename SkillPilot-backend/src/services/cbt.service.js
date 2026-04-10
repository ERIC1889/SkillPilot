const Question = require('../models/mongodb/Question');
const TestResult = require('../models/mongodb/TestResult');
const WrongAnswerNote = require('../models/mongodb/WrongAnswerNote');
const aiService = require('./ai.service');
const questionBank = require('./questionBank.service');
const ApiError = require('../utils/ApiError');

const getQuestions = async (certificationId, count = 20) => {
  const certId = Number(certificationId);

  // 문제가 없거나 요청 수량보다 적으면 AI 로 자동 보충
  const existing = await Question.countDocuments({ certificationId: certId });
  if (existing < count) {
    try {
      console.log(`[cbt] Cert ${certId} 문제 ${existing}개 부족 — AI 자동 생성 시작`);
      await questionBank.ensureQuestionsForCertification(certId, Math.max(15, Math.ceil(count / 2)));
    } catch (err) {
      console.warn('[cbt] 자동 문제 생성 실패:', err.message);
    }
  }

  const questions = await Question.aggregate([
    { $match: { certificationId: certId } },
    { $sample: { size: Number(count) } },
  ]);

  if (questions.length === 0) {
    throw ApiError.notFound('해당 자격증의 문제를 생성할 수 없습니다. 관리자에게 문의하세요.');
  }

  // Remove correctIndex from response
  return questions.map((q) => ({
    _id: q._id,
    subject: q.subject,
    question: q.question,
    options: q.options,
    difficulty: q.difficulty,
  }));
};

const submit = async (userId, { certificationId, answers }) => {
  // Fetch all questions for this submission
  const questionIds = answers.map((a) => a.questionId);
  const questions = await Question.find({ _id: { $in: questionIds } });
  const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

  let correctCount = 0;
  const questionResults = [];
  const wrongAnswers = [];

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) continue;

    const isCorrect = answer.selectedIndex === question.correctIndex;
    if (isCorrect) correctCount++;

    questionResults.push({
      questionId: question._id,
      selectedIndex: answer.selectedIndex,
      isCorrect,
    });

    if (!isCorrect) {
      wrongAnswers.push({
        question,
        selectedIndex: answer.selectedIndex,
      });
    }
  }

  const totalScore = Math.round((correctCount / answers.length) * 100);
  const accuracy = totalScore;

  // Calculate subject scores
  const subjectMap = new Map();
  for (const qr of questionResults) {
    const q = questionMap.get(qr.questionId.toString());
    if (!q) continue;
    if (!subjectMap.has(q.subject)) {
      subjectMap.set(q.subject, { correct: 0, total: 0 });
    }
    const s = subjectMap.get(q.subject);
    s.total++;
    if (qr.isCorrect) s.correct++;
  }

  const subjectScores = Array.from(subjectMap.entries()).map(([subject, data]) => ({
    subject,
    score: Math.round((data.correct / data.total) * 100),
    type: data.correct / data.total >= 0.6 ? '합격' : '불합격',
  }));

  // Save test result
  const testResult = await TestResult.create({
    userId,
    certificationId: Number(certificationId),
    questions: questionResults,
    totalScore,
    accuracy,
    subjectScores,
  });

  // Persist wrong answer notes immediately (without AI), then enrich in background
  const wrongNoteDocs = await Promise.all(
    wrongAnswers.map((wrong) => {
      const myAnswer = wrong.question.options[wrong.selectedIndex] || '미선택';
      const correctAnswer = wrong.question.options[wrong.question.correctIndex];
      return WrongAnswerNote.create({
        userId,
        testResultId: testResult._id,
        questionId: wrong.question._id,
        subject: wrong.question.subject,
        question: wrong.question.question,
        myAnswer,
        correctAnswer,
      });
    })
  );

  // Fire-and-forget: enrich with AI analysis in parallel, don't block the response
  Promise.all(
    wrongAnswers.map(async (wrong, idx) => {
      const note = wrongNoteDocs[idx];
      try {
        const analysis = await aiService.analyzeWrongAnswer(userId, {
          question: wrong.question.question,
          myAnswer: note.myAnswer,
          correctAnswer: note.correctAnswer,
        });
        note.explanation = analysis.explanation || '';
        note.tip = analysis.tip || '';
        await note.save();
      } catch (err) {
        console.warn('[cbt] 오답 AI 분석 실패:', err.message);
      }
    })
  ).catch(() => {});

  return testResult;
};

const getResults = async (userId) => {
  return TestResult.find({ userId }).sort({ createdAt: -1 });
};

const getResultDetail = async (userId, testId) => {
  const result = await TestResult.findOne({ _id: testId, userId });
  if (!result) {
    throw ApiError.notFound('시험 결과를 찾을 수 없습니다');
  }

  const wrongNotes = await WrongAnswerNote.find({
    testResultId: testId,
    userId,
  });

  return { result, wrongNotes };
};

module.exports = { getQuestions, submit, getResults, getResultDetail };
