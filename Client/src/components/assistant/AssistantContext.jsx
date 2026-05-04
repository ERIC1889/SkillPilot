import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { pick } from './messages';

const AssistantContext = createContext(null);

const DEFAULT_DURATION_MS = 5000;

export function AssistantProvider({ children }) {
  const [bubble, setBubble] = useState(null); // { text, mood, ts }
  const [open, setOpen] = useState(false);    // chat panel open
  const [unread, setUnread] = useState(0);
  const timerRef = useRef(null);

  const showMessage = useCallback((text, mood = 'cheer', durationMs = DEFAULT_DURATION_MS) => {
    if (!text) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setBubble({ text, mood, ts: Date.now() });
    if (!open) setUnread((n) => n + 1);
    timerRef.current = setTimeout(() => setBubble(null), durationMs);
  }, [open]);

  const cheer    = useCallback((path = 'cheer.correct') => showMessage(pick(path), 'cheer'), [showMessage]);
  const scold    = useCallback((path = 'scold.wrong')   => showMessage(pick(path), 'scold'), [showMessage]);
  const tip      = useCallback((path = 'tip.learning')  => showMessage(pick(path), 'tip'),   [showMessage]);
  const greet    = useCallback(() => showMessage(pick('idle.welcome'), 'idle'), [showMessage]);

  const openChat  = useCallback(() => { setOpen(true); setUnread(0); }, []);
  const closeChat = useCallback(() => setOpen(false), []);
  const toggleChat = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) setUnread(0);
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    bubble,
    open,
    unread,
    showMessage,
    cheer,
    scold,
    tip,
    greet,
    openChat,
    closeChat,
    toggleChat,
  }), [bubble, open, unread, showMessage, cheer, scold, tip, greet, openChat, closeChat, toggleChat]);

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    // 어시스턴트가 마운트되지 않은 환경(예: 로그인 페이지 단독 테스트)에서도 안전하게
    return {
      bubble: null,
      open: false,
      unread: 0,
      showMessage: () => {},
      cheer: () => {},
      scold: () => {},
      tip: () => {},
      greet: () => {},
      openChat: () => {},
      closeChat: () => {},
      toggleChat: () => {},
    };
  }
  return ctx;
}
