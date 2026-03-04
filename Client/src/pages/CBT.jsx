import React, { useState, useEffect } from 'react';
import '../styles/CBT.css'; // 기존 CBT 스타일
import AnswerAnalyze from './AnswerAnalyze';

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

const CBT = ({ onExit }) => {
  // 상태 관리
  const [isSubmitted, setIsSubmitted] = useState(false); // [핵심] 제출 상태
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); 
  const [answers, setAnswers] = useState({}); 
  const [marked, setMarked] = useState({});   

  // 더미 문제 데이터
  const mockQuestions = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    question: i === 2 
      ? "다음 중 스택(Stack) 자료구조의 특징으로 옳지 않은 것은?" 
      : `${i + 1}번 문제입니다. 이 문제의 정답을 골라주세요.`,
    options: i === 2 
      ? ["LIFO(Last In First Out) 구조이다", "push와 pop 연산을 사용한다", "데이터의 중간 삽입이 자유롭다", "함수 호출 시 복귀 주소 저장에 사용된다"]
      : ["첫 번째 보기 내용입니다.", "두 번째 보기 내용입니다.", "세 번째 보기 내용입니다.", "네 번째 보기 내용입니다."]
  }));

  // 타이머 동작
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return; // 제출되면 타이머 멈춤
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (idx) => setAnswers({ ...answers, [currentIndex]: idx });
  const toggleMark = () => setMarked({ ...marked, [currentIndex]: !marked[currentIndex] });
  const goNext = () => currentIndex < 19 && setCurrentIndex(prev => prev + 1);
  const goPrev = () => currentIndex > 0 && setCurrentIndex(prev => prev - 1);
  const solvedCount = Object.keys(answers).length;

  // [핵심] 제출 핸들러
  const handleSubmit = () => {
    if(window.confirm("정말 제출하시겠습니까?")) {
        setIsSubmitted(true); // 상태 변경 -> AnswerAnalyze 렌더링
        window.scrollTo(0, 0);
    }
  };

  // [변경] 제출 상태가 true이면 오답 분석 화면(AnswerAnalyze)을 보여줌
  if (isSubmitted) {
    return <AnswerAnalyze onExit={onExit} />;
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
            <h1 className="exam-title">정보처리기사 CBT 모의고사</h1>
          </div>
          
          <div className="exam-status">
            <div>전체 문제 수: 20문제</div>
            <div>안 푼 문제: {20 - solvedCount}문제</div>
            <div>현재 문제 {currentIndex + 1} / 20</div>
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

            <h2 className="question-text">{mockQuestions[currentIndex].question}</h2>

            <div className="options-list">
              {mockQuestions[currentIndex].options.map((option, idx) => {
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
             <button className="btn-submit" onClick={handleSubmit}>답안 제출</button>
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
              {mockQuestions.map((_, i) => {
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