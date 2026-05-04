import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

/**
 * size: sm | md | lg
 * - ESC 닫기 + 오버레이 클릭 닫기
 * - 열렸을 때 body 스크롤 잠금
 * - role="dialog" + aria-modal + aria-labelledby
 */
export default function Modal({
  open,
  onClose,
  title,
  size = 'md',
  closeOnOverlay = true,
  children,
  footer,
}) {
  const titleId = useRef(`sp-modal-title-${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="sp-modal__overlay"
      onClick={() => closeOnOverlay && onClose?.()}
      role="presentation"
    >
      <div
        className={`sp-modal sp-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <div className="sp-modal__header">
            {title ? <h2 id={titleId} className="sp-modal__title">{title}</h2> : <span />}
            {onClose ? (
              <button
                type="button"
                className="sp-modal__close"
                onClick={onClose}
                aria-label="닫기"
              >
                ×
              </button>
            ) : null}
          </div>
        )}
        <div className="sp-modal__body">{children}</div>
        {footer ? <div className="sp-modal__footer">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}
