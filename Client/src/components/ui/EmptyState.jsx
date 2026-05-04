import './EmptyState.css';

export default function EmptyState({
  icon = '📭',
  title = '표시할 내용이 없습니다',
  description,
  action,
  className = '',
}) {
  return (
    <div className={`sp-empty ${className}`} role="status">
      <div className="sp-empty__icon" aria-hidden="true">{icon}</div>
      <h3 className="sp-empty__title">{title}</h3>
      {description ? <p className="sp-empty__desc">{description}</p> : null}
      {action ? <div className="sp-empty__action">{action}</div> : null}
    </div>
  );
}
