import './StudyHeatmap.css';

/**
 * GitHub-style 학습 잔디밭. 가로로 7행 × N열(주 단위) 그리드.
 * Props:
 *  - daily: [{ date: 'YYYY-MM-DD', hours: number }] (오래된 → 최신 순)
 *  - weeks: 표시할 주 수 (기본 12 → 84일)
 */
export default function StudyHeatmap({ daily = [], weeks = 12 }) {
  const totalDays = weeks * 7;
  // 입력 길이가 부족하면 앞에 0 채움
  const padded = [];
  const need = totalDays - daily.length;
  if (need > 0) {
    for (let i = 0; i < need; i++) padded.push({ date: '', hours: 0 });
  }
  const series = [...padded, ...daily.slice(-totalDays)];

  // 강도 계산 (0~4 단계)
  const intensity = (h) => {
    if (!h || h <= 0) return 0;
    if (h < 1) return 1;
    if (h < 2) return 2;
    if (h < 4) return 3;
    return 4;
  };

  // 7행 × weeks열로 재배치 (열 단위 = 한 주)
  const cols = [];
  for (let c = 0; c < weeks; c++) {
    const col = [];
    for (let r = 0; r < 7; r++) {
      col.push(series[c * 7 + r]);
    }
    cols.push(col);
  }

  const totalHours = series.reduce((a, d) => a + (d.hours || 0), 0);
  const activeDays = series.filter((d) => d.hours > 0).length;

  return (
    <div className="sp-heatmap">
      <div className="sp-heatmap__head">
        <div>
          <div className="sp-heatmap__title">학습 잔디밭</div>
          <div className="sp-heatmap__sub">최근 {weeks}주 — {activeDays}일 학습 / 총 {totalHours.toFixed(1)}시간</div>
        </div>
        <div className="sp-heatmap__legend" aria-hidden="true">
          <span>적음</span>
          <span className="sp-heatmap__sample" data-level="0" />
          <span className="sp-heatmap__sample" data-level="1" />
          <span className="sp-heatmap__sample" data-level="2" />
          <span className="sp-heatmap__sample" data-level="3" />
          <span className="sp-heatmap__sample" data-level="4" />
          <span>많음</span>
        </div>
      </div>

      <div className="sp-heatmap__grid" role="img" aria-label={`최근 ${weeks}주 학습 기록`}>
        {cols.map((col, ci) => (
          <div key={ci} className="sp-heatmap__col">
            {col.map((cell, ri) => (
              <div
                key={ri}
                className="sp-heatmap__cell"
                data-level={intensity(cell?.hours)}
                title={cell?.date ? `${cell.date}: ${cell.hours || 0}시간` : ''}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
