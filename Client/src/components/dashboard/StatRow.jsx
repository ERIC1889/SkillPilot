import './StatRow.css';

/**
 * stats: [{ label, value, sub }]
 *  - 모두 동일한 SkillPilot navy 톤. 아이콘/accent 변형 없음.
 */
export default function StatRow({ stats = [] }) {
  return (
    <div className="sp-stat-row" role="list">
      {stats.map((s, i) => (
        <div key={i} className="sp-stat-card" role="listitem">
          <div className="sp-stat-card__body">
            <div className="sp-stat-card__value">{s.value}</div>
            <div className="sp-stat-card__label">{s.label}</div>
            {s.sub ? <div className="sp-stat-card__sub">{s.sub}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
