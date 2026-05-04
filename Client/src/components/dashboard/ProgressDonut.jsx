import './ProgressDonut.css';

/**
 * SVG 기반 도넛 차트 (단일 진행률).
 * Props:
 *  - value: 0~100
 *  - size: px (기본 160)
 *  - stroke: 두께 (기본 14)
 *  - label: 가운데 보조 라벨
 */
export default function ProgressDonut({
  value = 0,
  size = 160,
  stroke = 14,
  label = '진행률',
}) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (v / 100) * circumference;

  return (
    <div className="sp-donut" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label} ${v}%`}
      >
        <defs>
          <linearGradient id="sp-donut-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
        </defs>

        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        {/* progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#sp-donut-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="sp-donut__center">
        <div className="sp-donut__value">{v}<span>%</span></div>
        <div className="sp-donut__label">{label}</div>
      </div>
    </div>
  );
}
