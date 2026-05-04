import { useEffect, useMemo, useState } from 'react';
import { MESSAGE_POOL } from './messages';
import './CheerBanner.css';

/**
 * 격려/팁 메시지가 일정 간격으로 페이드 전환되는 배너.
 * messages.js 의 cheer/tip/idle 풀에서 가져와 무작위 순회.
 *
 * Props:
 *  - intervalMs: 회전 간격 (기본 7000)
 *  - className: 외부 추가 클래스
 */
export default function CheerBanner({ intervalMs = 7000, className = '' }) {
  // cheer/tip/idle 풀을 평탄화 + 셔플
  const pool = useMemo(() => {
    const items = [];
    const push = (mood, arr, icon) =>
      arr.forEach((text) => items.push({ text, mood, icon }));

    push('cheer', MESSAGE_POOL.cheer.streak, '🔥');
    push('cheer', MESSAGE_POOL.cheer.completed, '✨');
    push('cheer', MESSAGE_POOL.cheer.correct, '🎯');
    push('tip',   MESSAGE_POOL.tip.learning,  '💡');
    push('tip',   MESSAGE_POOL.tip.cbt,       '📚');
    push('tip',   MESSAGE_POOL.tip.interview, '🎤');
    push('idle',  MESSAGE_POOL.idle.random,   '🌱');

    // Fisher-Yates shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }, []);

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('in'); // 'in' | 'out'

  useEffect(() => {
    if (pool.length <= 1) return;
    const tick = setInterval(() => {
      // fade out → 교체 → fade in
      setPhase('out');
      setTimeout(() => {
        setIdx((i) => (i + 1) % pool.length);
        setPhase('in');
      }, 350);
    }, intervalMs);
    return () => clearInterval(tick);
  }, [pool.length, intervalMs]);

  if (pool.length === 0) return null;
  const item = pool[idx];

  return (
    <div
      className={`sp-cheer-banner sp-cheer-banner--${item.mood} ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="sp-cheer-banner__icon" aria-hidden="true">{item.icon}</span>
      <p className={`sp-cheer-banner__text is-${phase}`} key={idx}>
        {item.text}
      </p>
      <span className="sp-cheer-banner__dots" aria-hidden="true">
        {pool.slice(0, Math.min(5, pool.length)).map((_, i) => (
          <span
            key={i}
            className={`sp-cheer-banner__dot ${i === idx % 5 ? 'is-active' : ''}`}
          />
        ))}
      </span>
    </div>
  );
}
