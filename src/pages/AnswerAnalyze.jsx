import React from 'react';
import '../styles/AnswerAnalyze.css';

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

const AnswerAnalyze = ({ onExit }) => {
  const chartData = [
    { subject: '자료구조', score: 40, type: 'weak' },
    { subject: '알고리즘', score: 75, type: 'normal' },
    { subject: '데이터베이스', score: 60, type: 'normal' },
    { subject: '운영체제', score: 85, type: 'good' },
    { subject: '네트워크', score: 50, type: 'weak' },
  ];

  const mistakes = [
    {
      id: 1,
      subject: '자료구조',
      question: '다음 중 스택(Stack) 자료구조의 특징으로 옳지 않은 것은?',
      myAnswer: '데이터의 중간 삽입이 자유롭다',
      correctAnswer: 'push와 pop 연산을 사용한다',
      explanation: '스택은 LIFO(후입선출) 구조로, 데이터의 삽입과 삭제가 한쪽 끝에서만 일어납니다. 중간에 데이터를 삽입하거나 삭제할 수 없는 것이 스택의 핵심 특징입니다.',
      tip: '스택의 제한적 접근 특성을 활용한 실제 사례(브라우저 뒤로가기, 실행 취소 기능)를 학습하면 개념 이해에 도움이 됩니다.'
    },
    {
      id: 3,
      subject: '데이터베이스',
      question: '다음 중 데이터베이스의 정규화(Normalization)에 대한 설명으로 옳은 것은?',
      myAnswer: '데이터의 중복을 최대화한다',
      correctAnswer: '이상 현상을 제거하기 위한 과정이다',
      explanation: '정규화는 데이터베이스 설계 과정에서 중복을 최소화하고 데이터 무결성을 향상시키는 프로세스입니다. 삽입, 삭제, 갱신 이상을 방지합니다.',
      tip: '정규화의 각 단계(1NF, 2NF, 3NF)별 조건과 실제 테이블 예제를 비교하며 학습하면 효과적입니다.'
    }
  ];

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
             <span>92</span> / 100
          </div>
          
          <div className="score-details">
            <div className="detail-item">
               <span className="detail-label">정답</span>
               <span className="detail-value">28문항</span>
            </div>
            <div className="detail-item">
               <span className="detail-label">오답</span>
               <span className="detail-value red">2문항</span>
            </div>
            <div className="detail-item">
               <span className="detail-label">정답률</span>
               <span className="detail-value">92%</span>
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
          <button className="btn-roadmap" onClick={onExit}>로드맵 조정하기</button>
          <span className="footer-text">AI가 취약 영역을 반영하여 학습 로드맵을 재구성합니다</span>
        </div>

      </div>
    </div>
  );
};

export default AnswerAnalyze;