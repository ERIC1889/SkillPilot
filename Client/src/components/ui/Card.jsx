import './Card.css';

/**
 * padding: none | sm | md | lg
 * interactive: true 면 hover 시 살짝 떠보임
 */
export default function Card({
  padding = 'md',
  interactive = false,
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'sp-card',
    `sp-card--p-${padding}`,
    interactive && 'sp-card--interactive',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({ icon, title, action, className = '' }) {
  return (
    <div className={`sp-card__header ${className}`}>
      <div className="sp-card__header-left">
        {icon ? <span className="sp-card__header-icon" aria-hidden="true">{icon}</span> : null}
        {title ? <h3 className="sp-card__header-title">{title}</h3> : null}
      </div>
      {action ? <div className="sp-card__header-action">{action}</div> : null}
    </div>
  );
}
