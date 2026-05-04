import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/AnswerAnalyze.css';
import { Button, Loading, EmptyState } from '../components/ui';
import { useAssistant } from '../components/assistant';

const Icons = {
  Logo: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="12" fill="#1E293B"/>
        <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  CheckCircle: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  ChartLine: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  XCircle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  Bulb: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.9.93-1.54 1.86-1.78A6 6 0 0 0 12 2a6 6 0 0 0-5 10c0 .66.26 1.25.68 1.7L9 15v3h6v-3l1.09-1z"/></svg>
};

const AnswerAnalyze = ({ testId, onExit }) => {
  const assistant = useAssistant();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/cbt/results/' + testId);
        const { result: resultData, wrongNotes } = res.data.data;

        setResult(resultData);

        // 과목별 점수 차트 데이터
        const chart = (resultData.subjectScores || []).map(s => ({
          subject: s.subject,
          score: s.score,
          type: s.score >= 80 ? 'good' : s.score >= 60 ? 'normal' : 'weak'
        }));
        setChartData(chart);

        // 오답 목록
        const mistakeList = (wrongNotes || []).map(n => ({
          id: n._id,
          subject: n.subject,
          question: n.question,
          myAnswer: n.myAnswer,
          correctAnswer: n.correctAnswer,
          explanation: n.explanation || 'AI 분석 중...',
          tip: n.tip || ''
        }));
        setMistakes(mistakeList);

        // 정답/오답 수 계산
        const questions = resultData.questions || [];
        const correct = questions.filter(q => q.isCorrect).length;
        const wrong = questions.filter(q => !q.isCorrect).length;
        setCorrectCount(correct);
        setWrongCount(wrong);

        // 어시스턴트 — 결과 보고 적절한 멘트
        const accuracy = resultData.accuracy ?? 0;
        if (accuracy >= 80) {
          assistant.cheer('cheer.completed');
        } else if (accuracy >= 60) {
          assistant.tip('tip.cbt');
        } else {
          assistant.scold('scold.wrong');
        }
      } catch (err) {
        console.error('Failed to fetch results:', err);
        setError('결과를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [testId]);

  if (loading) {
    return (
      <div className="analyze-container">
        <Loading variant="block" size="lg" label="AI가 오답을 분석하고 있습니다" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="analyze-container">
        <EmptyState
          icon="⚠️"
          title="결과를 불러올 수 없습니다"
          description={error}
          action={<Button onClick={onExit}>돌아가기</Button>}
        />
      </div>
    );
  }

  return (
    <div className="analyze-container">
      {/* 1. 헤더 */}
      <header className="analyze-header">
        <div className="header-inner">
          <div className="logo-area">
            <img
                src="/SPLogo.png"
                alt="logo"
                style={{ width: '32px', height: 'auto', marginRight: '8px' }}
                onError={(e) => e.target.style.display='none'}
            />
            </div>
          <div className="header-logo-area">
             <h1 className="header-title">AI 오답 분석</h1>
             <span className="header-sub">AI가 분석한 맞춤형 학습 가이드</span>
          </div>
        </div>
      </header>

      <div className="analyze-content">

        {/* 2. 총점 카드 */}
        <section className="analyze-card score-section">
          <div className="score-title-row">
            <Icons.CheckCircle /> 총점
          </div>
          <div className="total-score">
             <span>{result.totalScore}</span> / 100
          </div>

          <div className="score-details">
            <div className="detail-item">
               <span className="detail-label">정답</span>
               <span className="detail-value">{correctCount}문항</span>
            </div>
            <div className="detail-item">
               <span className="detail-label">오답</span>
               <span className="detail-value red">{wrongCount}문항</span>
            </div>
            <div className="detail-item">
               <span className="detail-label">정답률</span>
               <span className="detail-value">{result.accuracy}%</span>
            </div>
          </div>
        </section>

        {/* 3. 취약 영역 분석 (차트) */}
        <section className="analyze-card">
          <div className="section-title">
            <Icons.ChartLine /> 취약 영역 분석
          </div>

          <div className="chart-wrapper">
            {chartData.map((item, idx) => (
              <div key={idx} className="bar-container">
                <div
                  className={`bar ${item.type}`}
                  style={{ height: `${item.score}%` }}
                  data-score={`${item.score}점`}
                ></div>
                <span className="bar-label">{item.subject}</span>
              </div>
            ))}
          </div>

          <div className="chart-legend">
            <div className="legend-item"><div className="dot weak"></div> 60점 미만 (취약)</div>
            <div className="legend-item"><div className="dot normal"></div> 60-79점 (보통)</div>
            <div className="legend-item"><div className="dot good"></div> 80점 이상 (우수)</div>
          </div>
        </section>

        {/* 4. 오답 문제 분석 리스트 */}
        <div className="section-title" style={{ marginTop: '10px' }}>
            <Icons.XCircle /> 오답 문제 분석
        </div>

        {mistakes.map((item) => (
          <section key={item.id} className="analyze-card mistake-card">
            <div className="mistake-header">
              <span className="badge-num">문제 {item.id}</span>
              <span className="badge-subject">{item.subject}</span>
            </div>

            <div className="mistake-body">
              <h3 className="question-text">{item.question}</h3>

              <div className="compare-box">
                <div className="answer-block my">
                  <span className="ans-label">내가 선택한 답</span>
                  <div className="ans-value">{item.myAnswer}</div>
                </div>
                <div className="answer-block correct">
                  <span className="ans-label">정답</span>
                  <div className="ans-value">{item.correctAnswer}</div>
                </div>
              </div>

              <div className="ai-explanation">
                <div className="exp-header"><Icons.Bulb /> AI 해설</div>
                <div className="exp-content">{item.explanation}</div>
              </div>

              <div className="study-tip">
                <span className="tip-header">💡 학습 팁</span>
                <div className="tip-content">{item.tip}</div>
              </div>
            </div>
          </section>
        ))}

        {/* 5. 하단 버튼 */}
        <div className="footer-action">
          <Button size="lg" onClick={onExit}>로드맵 조정하기</Button>
          <span className="footer-text">AI가 취약 영역을 반영하여 학습 로드맵을 재구성합니다</span>
        </div>

      </div>
    </div>
  );
};

export default AnswerAnalyze;
