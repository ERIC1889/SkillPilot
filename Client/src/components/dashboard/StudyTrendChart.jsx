import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import './StudyTrendChart.css';

/**
 * 최근 N일 학습 시간 추이 (Recharts AreaChart).
 * Props:
 *  - daily: [{ date: 'YYYY-MM-DD', hours: number }]
 *  - days: 최근 N일만 표시 (기본 14)
 */
export default function StudyTrendChart({ daily = [], days = 14 }) {
  const slice = daily.slice(-days).map((d) => ({
    ...d,
    label: d.date ? d.date.slice(5).replace('-', '/') : '',
  }));

  const total = slice.reduce((a, d) => a + (d.hours || 0), 0);
  const max = slice.reduce((m, d) => Math.max(m, d.hours || 0), 0);

  return (
    <div className="sp-trend">
      <div className="sp-trend__head">
        <div>
          <div className="sp-trend__title">학습 시간 추이</div>
          <div className="sp-trend__sub">최근 {slice.length}일 · 총 {total.toFixed(1)}시간 · 최대 {max.toFixed(1)}시간/일</div>
        </div>
      </div>
      <div className="sp-trend__chart">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={slice} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="sp-trend-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor="#3b82f6" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              cursor={{ stroke: '#cbd5e1', strokeDasharray: 3 }}
              contentStyle={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v) => [`${v}시간`, '학습']}
              labelFormatter={(l) => `${l}`}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#sp-trend-grad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
