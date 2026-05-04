import { forwardRef, useId } from 'react';
import './Input.css';

const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    leftIcon,
    rightIcon,
    id: idProp,
    className = '',
    fullWidth = true,
    ...rest
  },
  ref
) {
  const reactId = useId();
  const id = idProp || `sp-input-${reactId}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div
      className={[
        'sp-field',
        fullWidth && 'sp-field--full',
        error && 'is-error',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label ? (
        <label className="sp-field__label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <div className="sp-field__control">
        {leftIcon ? <span className="sp-field__icon sp-field__icon--left" aria-hidden="true">{leftIcon}</span> : null}
        <input
          ref={ref}
          id={id}
          className="sp-field__input"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {rightIcon ? <span className="sp-field__icon sp-field__icon--right" aria-hidden="true">{rightIcon}</span> : null}
      </div>
      {hint && !error ? <p id={hintId} className="sp-field__hint">{hint}</p> : null}
      {error ? <p id={errorId} className="sp-field__error" role="alert">{error}</p> : null}
    </div>
  );
});

export default Input;
