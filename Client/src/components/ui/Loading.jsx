import './Loading.css';

/**
 * variant: inline | block | overlay
 * size:    sm | md | lg
 */
export default function Loading({
  variant = 'inline',
  size = 'md',
  label = '로딩 중',
  hideLabel = false,
}) {
  return (
    <div
      className={`sp-loading sp-loading--${variant} sp-loading--${size}`}
      role="status"
      aria-live="polite"
    >
      <span className="sp-loading__spinner" aria-hidden="true" />
      <span className={hideLabel ? 'sr-only' : 'sp-loading__label'}>{label}</span>
    </div>
  );
}
