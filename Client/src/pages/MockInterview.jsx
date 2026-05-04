// 모의면접 페이지 — Phase 5 에서 전체 구현
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button, Loading } from '../components/ui';
import { useAssistant } from '../components/assistant';
import '../styles/mockInterview.css';

export default function MockInterview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const assistant = useAssistant();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [turns, setTurns] = useState([]);
  const [role, setRole] = useState('');
  const [started, setStarted] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, loading]);

  const start = async () => {
    if (!role.trim()) {
      setError('직무를 입력하세요');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/mock-interview/start', { role: role.trim() });
      const data = res.data.data;
      setSession(data);
      setTurns([{ role: 'interviewer', text: data.firstQuestion }]);
      setStarted(true);
      assistant.tip('tip.interview');
    } catch (err) {
      setError(err.response?.data?.message || '면접 시작 실패');
    } finally {
      setLoading(false);
    }
  };

  const sendAnswer = async () => {
    if (!answer.trim() || !session) return;
    const myTurn = { role: 'candidate', text: answer.trim() };
    setTurns((prev) => [...prev, myTurn]);
    setAnswer('');
    setLoading(true);
    try {
      const res = await api.post(`/mock-interview/${session.sessionId}/answer`, {
        answer: myTurn.text,
      });
      const data = res.data.data;
      const next = [];
      if (data.feedback) next.push({ role: 'feedback', text: data.feedback, score: data.score });
      if (data.nextQuestion) next.push({ role: 'interviewer', text: data.nextQuestion });
      if (data.done) next.push({ role: 'system', text: '면접이 종료되었습니다.' });
      setTurns((prev) => [...prev, ...next]);
      if (data.done) {
        setSession((s) => ({ ...s, done: true }));
        assistant.cheer('cheer.completed');
      } else if (typeof data.score === 'number') {
        if (data.score >= 80) assistant.cheer('cheer.interview');
        else if (data.score < 60) assistant.scold('scold.wrong');
      }
    } catch (err) {
      setError(err.response?.data?.message || '응답 처리 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mock-interview-page">
      <header className="mi-header">
        <button type="button" className="mi-back" onClick={() => navigate('/dashboard')} aria-label="대시보드로 돌아가기">
          ← 대시보드
        </button>
        <h1>AI 모의면접</h1>
      </header>

      {!started ? (
        <div className="mi-setup">
          <div className="mi-setup__hero">
            <span className="mi-setup__emoji" aria-hidden="true">🎤</span>
            <h2 className="mi-setup__title">실전처럼, 부담 없이</h2>
            <p className="mi-setup__subtitle">
              지원 직무를 고르면 AI 면접관이 5문항 안팎의 기술 질문을 던집니다.<br />
              답변마다 점수와 피드백을 받고, 끝나면 학습 메이트가 정리해줄게요.
            </p>
          </div>

          <div className="mi-setup__steps" aria-hidden="true">
            <div className="mi-setup__step"><b>1</b> 직무 선택</div>
            <span className="mi-setup__step-arrow">→</span>
            <div className="mi-setup__step"><b>2</b> 질문 답변</div>
            <span className="mi-setup__step-arrow">→</span>
            <div className="mi-setup__step"><b>3</b> 피드백 + 점수</div>
          </div>

          <div className="mi-setup__field">
            <label htmlFor="mi-role-input" className="mi-setup__label">
              지원 직무
            </label>
            <input
              id="mi-role-input"
              className="mi-setup__input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="예) 백엔드 개발자, 데이터 엔지니어"
              autoFocus
            />
          </div>

          <div className="mi-setup__quick">
            <span className="mi-setup__quick-label">빠른 선택</span>
            <div className="mi-setup__chips" role="group" aria-label="빠른 직무 선택">
              {[
                { label: '백엔드 개발자',   icon: '🛠️' },
                { label: '프론트엔드 개발자', icon: '🎨' },
                { label: '데이터 분석가',   icon: '📊' },
                { label: '데이터 엔지니어', icon: '🗄️' },
                { label: 'AI 엔지니어',     icon: '🤖' },
                { label: 'iOS 개발자',      icon: '📱' },
                { label: 'DevOps 엔지니어', icon: '⚙️' },
                { label: '보안 엔지니어',   icon: '🛡️' },
              ].map((r) => {
                const active = role === r.label;
                return (
                  <button
                    type="button"
                    key={r.label}
                    className={`mi-setup__chip ${active ? 'is-active' : ''}`}
                    onClick={() => setRole(r.label)}
                    aria-pressed={active}
                  >
                    <span aria-hidden="true">{r.icon}</span>
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="mi-error" role="alert">{error}</p>}

          <div className="mi-setup__actions">
            <Button size="lg" fullWidth loading={loading} onClick={start}>
              {loading ? '면접관을 불러오는 중...' : '면접 시작하기'}
            </Button>
            <p className="mi-setup__hint">
              💡 답변은 한국어로 자유롭게. 모르면 모른다고 말해도 점수가 깎이지 않아요.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mi-conversation" ref={scrollRef} aria-live="polite">
            {turns.map((t, i) => (
              <div key={i} className={`mi-turn mi-${t.role}`}>
                {t.role === 'interviewer' && <strong>면접관</strong>}
                {t.role === 'candidate' && <strong>{user?.name || '나'}</strong>}
                {t.role === 'feedback' && (
                  <strong>
                    피드백{typeof t.score === 'number' ? ` · ${t.score}점` : ''}
                  </strong>
                )}
                {t.role === 'system' && <strong>안내</strong>}
                <p>{t.text}</p>
              </div>
            ))}
            {loading && (
              <div className="mi-loading">
                <Loading size="sm" label="AI 응답 생성 중" />
              </div>
            )}
          </div>

          {!session?.done && (
            <div className="mi-input">
              <label htmlFor="mi-answer-input" className="sr-only">답변</label>
              <textarea
                id="mi-answer-input"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="답변을 입력하세요"
                rows={3}
              />
              <Button onClick={sendAnswer} disabled={loading || !answer.trim()}>
                전송
              </Button>
            </div>
          )}

          {error && <p className="mi-error" role="alert">{error}</p>}
        </>
      )}
    </main>
  );
}
