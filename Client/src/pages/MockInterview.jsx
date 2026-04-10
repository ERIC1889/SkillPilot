// 모의면접 페이지 — Phase 5 에서 전체 구현
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/mockInterview.css';

export default function MockInterview() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      if (data.done) setSession((s) => ({ ...s, done: true }));
    } catch (err) {
      setError(err.response?.data?.message || '응답 처리 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mock-interview-page">
      <header className="mi-header">
        <button className="mi-back" onClick={() => navigate('/dashboard')}>← 대시보드</button>
        <h1>AI 모의면접</h1>
      </header>

      {!started ? (
        <div className="mi-setup">
          <label>지원 직무</label>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="예) 백엔드 개발자, 데이터 엔지니어"
          />
          {error && <p className="mi-error">{error}</p>}
          <button onClick={start} disabled={loading}>{loading ? '시작 중...' : '면접 시작'}</button>
        </div>
      ) : (
        <>
          <div className="mi-conversation" ref={scrollRef}>
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
            {loading && <div className="mi-loading">AI 응답 생성 중...</div>}
          </div>

          {!session?.done && (
            <div className="mi-input">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="답변을 입력하세요"
                rows={3}
              />
              <button onClick={sendAnswer} disabled={loading || !answer.trim()}>
                전송
              </button>
            </div>
          )}

          {error && <p className="mi-error">{error}</p>}
        </>
      )}
    </div>
  );
}
