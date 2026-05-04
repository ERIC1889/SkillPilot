import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import '../styles/CBT.css';
import AnswerAnalyze from './AnswerAnalyze';
import { Button, Loading, EmptyState } from '../components/ui';
import { useAssistant } from '../components/assistant';

const Icons = {
  Flag: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
       <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
       <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2"></line>
    </svg>
  ),
  Clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  Next: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>,
  Prev: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
};

const CBT = ({ onExit, certId, certTitle }) => {
  const assistant = useAssistant();

  // 상태 관리
  const [mode, setMode] = useState('menu'); // 'menu' | 'taking'
  const [testId, setTestId] = useState(null); // 제출 후 결과 ID
  const [viewingTestId, setViewingTestId] = useState(null); // 과거 기록 조회용
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const greetedRef = useRef(false);

  // 어시스턴트 — 메뉴 진입 시 한 번 인사
  useEffect(() => {
    if (mode === 'menu' && !greetedRef.current) {
      assistant.tip('tip.cbt');
      greetedRef.current = true;
    }
    if (mode === 'taking') {
      assistant.cheer('cheer.streak');
    }
  }, [mode, assistant]);

  // 어시스턴트 — 5문제마다 응원, 답 안 하면 채찍
  useEffect(() => {
    if (mode !== 'taking' || questions.length === 0) return;
    if (currentIndex > 0 && currentIndex % 5 === 0) {
      assistant.cheer('cheer.streak');
    }
  }, [currentIndex, mode, questions.length, assistant]);

  // 시간 30초 남았을 때 채찍
  useEffect(() => {
    if (mode === 'taking' && timeLeft === 30) {
      assistant.scold('scold.timeout');
    }
  }, [timeLeft, mode, assistant]);

  // 이전 응시 기록 불러오기 (메뉴 모드)
  useEffect(() => {
    if (mode !== 'menu' || viewingTestId || testId) return;
    let alive = true;
    (async () => {
      try {
        setHistoryLoading(true);
        const res = await api.get('/cbt/results');
        if (!alive) return;
        const data = res.data?.data || [];
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        if (alive) setHistoryLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [mode, viewingTestId, testId]);

  // 문제 데이터 불러오기 (시작 버튼을 눌렀을 때만)
  useEffect(() => {
    if (mode !== 'taking') return;
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/cbt/questions', {
          params: { certificationId: certId, count: 20 }
        });
        const data = res.data.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data);
        } else {
          setError('문제를 불러올 수 없습니다. 등록된 문제가 없습니다.');
        }
      } catch (err) {
        console.error('Failed to fetch questions:', err);
        setError('문제를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [mode, certId]);

  // 타이머 동작
  useEffect(() => {
    if (timeLeft <= 0 || testId || loading) return; // 제출되면 타이머 멈춤
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, testId, loading]);

  // certId 없으면 안내 화면 — hooks 호출 다음 위치
  if (!certId) {
    return (
      <div className="cbt-fullscreen-container">
        <EmptyState
          icon="📚"
          title="자격증을 먼저 선택해주세요"
          description="대시보드에서 자격증을 선택하면 CBT 모의고사를 시작할 수 있습니다."
          action={<Button onClick={onExit}>돌아가기</Button>}
        />
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (idx) => setAnswers({ ...answers, [currentIndex]: idx });
  const toggleMark = () => setMarked({ ...marked, [currentIndex]: !marked[currentIndex] });
  const goNext = () => currentIndex < questions.length - 1 && setCurrentIndex(prev => prev + 1);
  const goPrev = () => currentIndex > 0 && setCurrentIndex(prev => prev - 1);
  const solvedCount = Object.keys(answers).length;

  // [핵심] 제출 핸들러
  const handleSubmit = async () => {
    if (!window.confirm("정말 제출하시겠습니까?")) return;

    try {
      setSubmitting(true);
      const answerPayload = questions.map((q, idx) => ({
        questionId: q._id,
        selectedIndex: answers[idx] !== undefined ? answers[idx] : -1
      }));

      const res = await api.post('/cbt/submit', {
        certificationId: certId,
        answers: answerPayload
      });

      const resultId = res.data.data._id;
      setTestId(resultId);
      assistant.cheer('cheer.completed');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Failed to submit:', err);
      alert('답안 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  // 과거 기록 상세 조회
  if (viewingTestId) {
    return (
      <AnswerAnalyze
        testId={viewingTestId}
        onExit={() => setViewingTestId(null)}
      />
    );
  }

  // [변경] 제출 완료 시 오답 분석 화면(AnswerAnalyze)을 보여줌
  if (testId) {
    return <AnswerAnalyze testId={testId} onExit={onExit} />;
  }

  // 메뉴 화면: 시작 버튼 + 이전 기록 목록
  if (mode === 'menu') {
    return (
      <div className="cbt-fullscreen-container">
        <header className="cbt-header">
          <div className="header-content">
            <div className="logo-area">
              <img
                src="/SPLogo.png"
                alt="logo"
                style={{ width: '32px', height: 'auto', marginRight: '8px' }}
                onError={(e) => e.target.style.display = 'none'}
              />
              <h1 className="exam-title">{certTitle ? `${certTitle} CBT 모의고사` : 'CBT 모의고사'}</h1>
            </div>
          </div>
        </header>

        <main className="cbt-menu-main">
          <div className="cbt-menu-actions">
            <Button size="lg" onClick={() => setMode('taking')}>새 모의고사 시작</Button>
            <Button size="lg" variant="ghost" onClick={onExit}>돌아가기</Button>
          </div>

          <h2 className="cbt-menu-section-title">이전 응시 기록</h2>

          {historyLoading && <Loading variant="block" label="불러오는 중" />}

          {!historyLoading && history.length === 0 && (
            <EmptyState icon="📝" title="아직 응시한 모의고사가 없습니다" />
          )}

          {!historyLoading && history.length > 0 && (
            <ul className="cbt-history-list">
              {history.map((r) => {
                const date = r.createdAt ? new Date(r.createdAt).toLocaleString('ko-KR') : '-';
                const score = typeof r.totalScore === 'number' ? r.totalScore : '-';
                const correct = (r.questions || []).filter((q) => q.isCorrect).length;
                const total = (r.questions || []).length;
                return (
                  <li
                    key={r._id}
                    className="cbt-history-item"
                    onClick={() => setViewingTestId(r._id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setViewingTestId(r._id);
                      }
                    }}
                  >
                    <div>
                      <div className="cbt-history-date">{date}</div>
                      <div className="cbt-history-meta">정답 {correct}/{total}문항</div>
                    </div>
                    <div className={`cbt-history-score ${score !== '-' && score >= 60 ? 'is-pass' : 'is-fail'}`}>
                      {score}점
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </main>
      </div>
    );
  }

  // 로딩 상태
  if (loading) {
    return (
      <div className="cbt-fullscreen-container">
        <Loading variant="block" size="lg" label="문제를 불러오는 중" />
      </div>
    );
  }

  // 에러 또는 문제 없음 상태
  if (error || questions.length === 0) {
    return (
      <div className="cbt-fullscreen-container">
        <EmptyState
          icon="⚠️"
          title="문제를 불러올 수 없습니다"
          description={error || '등록된 문제가 없습니다.'}
          action={<Button onClick={onExit}>돌아가기</Button>}
        />
      </div>
    );
  }

  // 제출 전이면 기존 CBT 문제 풀이 화면 렌더링
  return (
    <div className="cbt-fullscreen-container">

      {/* 헤더 */}
      <header className="cbt-header">
        <div className="header-content">
          <div className="logo-area">
            <img
                src="/SPLogo.png"
                alt="logo"
                style={{ width: '32px', height: 'auto', marginRight: '8px' }}
                onError={(e) => e.target.style.display='none'}
            />
            <h1 className="exam-title">{certTitle ? `${certTitle} CBT 모의고사` : 'CBT 모의고사'}</h1>
          </div>

          <div className="exam-status">
            <div>전체 문제 수: {questions.length}문제</div>
            <div>안 푼 문제: {questions.length - solvedCount}문제</div>
            <div>현재 문제 {currentIndex + 1} / {questions.length}</div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="main-container">
        {/* 왼쪽 문제 영역 */}
        <section className="left-panel">
          <div className="question-badge">문제 {currentIndex + 1}</div>

          <div className="question-card">
            <button
              className={`flag-btn ${marked[currentIndex] ? 'active' : ''}`}
              onClick={toggleMark}
              title="검토 표시"
            >
              <Icons.Flag />
            </button>

            <h2 className="question-text">{questions[currentIndex].question}</h2>

            <div className="options-list">
              {questions[currentIndex].options.map((option, idx) => {
                const isSelected = answers[currentIndex] === idx;
                return (
                  <div
                    key={idx}
                    className={`option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleAnswer(idx)}
                  >
                    <span className="option-circle">{idx + 1}</span>
                    <span className="option-text">{option}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="nav-area">
            <button className="nav-btn btn-prev" onClick={goPrev} disabled={currentIndex === 0}>
               <Icons.Prev /> 이전 문제
            </button>
            <button className="nav-btn btn-next" onClick={goNext}>
              다음 문제 <Icons.Next />
            </button>
          </div>

          <div className="submit-area">
             {/* onClick에 handleSubmit 연결 */}
             <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
               {submitting ? '제출 중...' : '답안 제출'}
             </button>
          </div>
        </section>

        {/* 오른쪽 위젯 영역 */}
        <aside className="right-panel">
          <div className="widget-card timer-widget">
            <div className="timer-label"><Icons.Clock /> 남은 시간</div>
            <div className="timer-value">{formatTime(timeLeft)}</div>
            <div className="timer-sub">제한 시간: 10분</div>
          </div>

          <div className="widget-card">
            <div className="omr-header">문제 목록</div>
            <div className="omr-grid">
              {questions.map((_, i) => {
                const isCurrent = i === currentIndex;
                const isSolved = answers[i] !== undefined;
                let itemClass = "omr-item";
                if (isCurrent) itemClass += " current";
                else if (isSolved) itemClass += " solved";

                return (
                  <div key={i} className={itemClass} onClick={() => setCurrentIndex(i)}>
                    {i + 1}
                    {marked[i] && <div className="dot-mark"></div>}
                  </div>
                );
              })}
            </div>

            <div className="omr-legend">
                <div className="legend-item">
                    <div className="legend-box current"></div>
                    <span>현재 문제</span>
                </div>
                <div className="legend-item">
                    <div className="legend-box solved"></div>
                    <span>푼 문제</span>
                </div>
                <div className="legend-item">
                    <div className="legend-box unsolved"></div>
                    <span>안 푼 문제</span>
                </div>
                <div className="legend-item">
                    <div className="legend-box marked"></div>
                    <span>검토 표시</span>
                </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default CBT;
