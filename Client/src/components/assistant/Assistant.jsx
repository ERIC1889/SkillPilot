import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAssistant } from './AssistantContext';
import { generateChatReply, pick } from './messages';
import api from '../../services/api';
import './Assistant.css';

// 라우트별 첫 진입 멘트 매핑
const ROUTE_GREETING = {
  '/dashboard':                     { mood: 'cheer', path: 'idle.welcome' },
  '/WeeklyRoadmap':                 { mood: 'tip',   path: 'tip.learning' },
  '/CertificationRecommendation':   { mood: 'idle',  path: 'idle.welcome' },
  '/portfolio':                     { mood: 'cheer', path: 'cheer.completed' },
  '/portfolio/preview':             { mood: 'cheer', path: 'cheer.completed' },
  '/mock-interview':                { mood: 'tip',   path: 'tip.interview' },
  '/job-matching':                  { mood: 'idle',  path: 'idle.random' },
  '/goalsetting':                   { mood: 'tip',   path: 'tip.learning' },
};

const HIDDEN_ON = ['/', '/signup'];

export default function Assistant() {
  const { bubble, open, unread, showMessage, openChat, closeChat, toggleChat } = useAssistant();
  const location = useLocation();
  const [chatLog, setChatLog] = useState([
    { from: 'bot', text: '안녕! 같이 한 페이지씩 끝내봐요. 막히면 언제든 불러요.' },
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const idleTimerRef = useRef(null);
  const lastPathRef = useRef(null);
  const inputRef = useRef(null);
  const firstMountRef = useRef(true);

  // 첫 마운트 — 환영 말풍선 강제 표시 (라우트 매칭 안 돼도)
  useEffect(() => {
    if (!firstMountRef.current) return;
    firstMountRef.current = false;
    if (HIDDEN_ON.includes(location.pathname)) return;
    const t = setTimeout(() => {
      showMessage('안녕하세요! 옆에서 도와드릴게요 🙌  궁금한 게 생기면 저를 클릭해 주세요!', 'cheer', 6500);
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 라우트 변경 시 그 페이지에 어울리는 멘트
  useEffect(() => {
    if (HIDDEN_ON.includes(location.pathname)) return;
    if (lastPathRef.current === location.pathname) return;
    lastPathRef.current = location.pathname;

    const greet = ROUTE_GREETING[location.pathname];
    if (greet) {
      const text = pick(greet.path);
      if (text) showMessage(text, greet.mood, 4500);
    }
  }, [location.pathname, showMessage]);

  // 비활동 채찍 — 90초 마우스/키보드 안 움직이면 한 마디
  useEffect(() => {
    if (HIDDEN_ON.includes(location.pathname)) return;

    const reset = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        const text = pick('scold.inactive');
        if (text) showMessage(text, 'scold', 5000);
      }, 90_000);
    };
    reset();
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [location.pathname, showMessage]);

  // 챗 열릴 때 입력 포커스
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (HIDDEN_ON.includes(location.pathname)) return null;

  const handleSend = async (e) => {
    e?.preventDefault?.();
    const text = draft.trim();
    if (!text || sending) return;

    const nextLog = [...chatLog, { from: 'user', text }];
    setChatLog(nextLog);
    setDraft('');
    setSending(true);

    try {
      const res = await api.post('/assistant/chat', {
        message: text,
        history: nextLog.slice(-10), // 최근 10턴만
      });
      const reply = res.data?.data?.reply || generateChatReply(text);
      setChatLog((log) => [...log, { from: 'bot', text: reply }]);
    } catch (err) {
      // 네트워크/AI 실패 시 mock fallback — 시연 안전망
      const reply = generateChatReply(text);
      setChatLog((log) => [
        ...log,
        { from: 'bot', text: reply, fallback: true },
      ]);
    } finally {
      setSending(false);
      // 새 메시지 도착 후 입력 다시 포커스
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  };

  const moodClass = bubble ? `is-${bubble.mood}` : '';

  return (
    <div className="sp-assistant" aria-live="polite">
      {/* 말풍선 (채팅 패널이 닫혔을 때만) */}
      {bubble && !open ? (
        <button
          type="button"
          className={`sp-assistant__bubble ${moodClass}`}
          onClick={openChat}
          aria-label="어시스턴트 메시지: 클릭하여 챗 열기"
        >
          <span className="sp-assistant__bubble-text">{bubble.text}</span>
          <span className="sp-assistant__bubble-tail" aria-hidden="true" />
        </button>
      ) : null}

      {/* 챗 패널 */}
      {open ? (
        <div
          className="sp-assistant__panel"
          role="dialog"
          aria-label="학습 어시스턴트 채팅"
        >
          <header className="sp-assistant__panel-header">
            <div className="sp-assistant__panel-title">
              <span className="sp-assistant__avatar-mini" aria-hidden="true">🦉</span>
              <div>
                <strong>학습 메이트</strong>
                <span className="sp-assistant__panel-sub">옆에서 응원하고, 가끔은 채찍질도</span>
              </div>
            </div>
            <button
              type="button"
              className="sp-assistant__icon-btn"
              onClick={closeChat}
              aria-label="챗 닫기"
            >
              ×
            </button>
          </header>
          <div className="sp-assistant__log" role="log">
            {chatLog.map((m, i) => (
              <div key={i} className={`sp-assistant__msg sp-assistant__msg--${m.from}`}>
                <span>
                  {m.text}
                  {m.fallback ? (
                    <span className="sp-assistant__fallback-tag" title="AI 연결 실패로 기본 응답">offline</span>
                  ) : null}
                </span>
              </div>
            ))}
            {sending && (
              <div className="sp-assistant__msg sp-assistant__msg--bot" aria-live="polite">
                <span className="sp-assistant__typing" aria-label="응답 작성 중">
                  <i /><i /><i />
                </span>
              </div>
            )}
          </div>
          <form className="sp-assistant__form" onSubmit={handleSend}>
            <input
              ref={inputRef}
              type="text"
              className="sp-assistant__input"
              placeholder={sending ? '응답을 기다리는 중...' : '물어보거나 한 줄 적어봐요'}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="메시지 입력"
              disabled={sending}
            />
            <button
              type="submit"
              className="sp-assistant__send"
              aria-label="보내기"
              disabled={sending || !draft.trim()}
            >
              ↑
            </button>
          </form>
        </div>
      ) : null}

      {/* 플로팅 캐릭터 + 라벨 알약 (항상 보임) */}
      <button
        type="button"
        className={`sp-assistant__dock ${open ? 'is-open' : ''}`}
        onClick={toggleChat}
        aria-label={open ? '챗 닫기' : '학습 어시스턴트 열기'}
      >
        <span className="sp-assistant__avatar" aria-hidden="true">
          <span className="sp-assistant__avatar-ring" />
          <span className="sp-assistant__avatar-emoji">🦉</span>
        </span>
        {!open ? (
          <span className="sp-assistant__label">
            <span className="sp-assistant__label-title">학습 메이트</span>
            <span className="sp-assistant__label-sub">클릭해서 대화하기</span>
          </span>
        ) : null}
        {unread > 0 && !open ? (
          <span className="sp-assistant__badge" aria-label={`읽지 않은 메시지 ${unread}개`}>
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>
    </div>
  );
}
