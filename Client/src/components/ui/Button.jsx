import './Button.css';

/**
 * variant: primary | secondary | ghost | danger
 * size:    sm | md | lg
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'sp-btn',
    `sp-btn--${variant}`,
    `sp-btn--${size}`,
    fullWidth && 'sp-btn--full',
    loading && 'is-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className="sp-btn__spinner" aria-hidden="true" />
      ) : leftIcon ? (
        <span className="sp-btn__icon" aria-hidden="true">{leftIcon}</span>
      ) : null}
      <span className="sp-btn__label">{children}</span>
      {!loading && rightIcon ? (
        <span className="sp-btn__icon" aria-hidden="true">{rightIcon}</span>
      ) : null}
    </button>
  );
}
