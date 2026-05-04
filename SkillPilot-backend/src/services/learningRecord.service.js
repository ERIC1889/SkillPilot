const LearningRecord = require('../models/mongodb/LearningRecord');

const create = async (userId, { date, studyHours, topics, notes }) => {
  const record = await LearningRecord.create({
    userId,
    date: new Date(date),
    studyHours: Number(studyHours) || 0,
    topics: Array.isArray(topics) ? topics : [],
    notes: notes || '',
  });
  return record;
};

const list = async (userId, { from, to } = {}) => {
  const filter = { userId };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  return LearningRecord.find(filter).sort({ date: -1 });
};

const dayKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

const summary = async (userId) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const trendStart = new Date(now);
  trendStart.setDate(now.getDate() - 29); // 최근 30일
  trendStart.setHours(0, 0, 0, 0);

  const [monthRecords, weekRecords, trendRecords] = await Promise.all([
    LearningRecord.find({ userId, date: { $gte: monthStart } }),
    LearningRecord.find({ userId, date: { $gte: weekStart } }),
    LearningRecord.find({ userId, date: { $gte: trendStart } }),
  ]);

  const sum = (rs) => rs.reduce((a, r) => a + (r.studyHours || 0), 0);

  // 최근 30일 일별 학습 시간 (heatmap + line chart 공용)
  const hoursByDay = new Map();
  for (const r of trendRecords) {
    const k = dayKey(r.date);
    hoursByDay.set(k, (hoursByDay.get(k) || 0) + (r.studyHours || 0));
  }
  const daily = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const k = dayKey(d);
    daily.push({ date: k, hours: Number((hoursByDay.get(k) || 0).toFixed(2)) });
  }

  // 연속 학습일(streak) — 오늘부터 거꾸로 학습 기록 있는 날 카운트.
  // 오늘 기록이 없으면 어제부터 카운트(오늘은 아직 안 한 것일 수 있음).
  let streak = 0;
  const todayKey = dayKey(now);
  const startOffset = hoursByDay.has(todayKey) ? 0 : 1;
  for (let i = startOffset; i < 365; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const k = dayKey(d);
    if (hoursByDay.has(k) && hoursByDay.get(k) > 0) {
      streak++;
    } else if (i >= startOffset) {
      break;
    }
  }

  return {
    monthHours: Number(sum(monthRecords).toFixed(2)),
    weekHours: Number(sum(weekRecords).toFixed(2)),
    monthCount: monthRecords.length,
    weekCount: weekRecords.length,
    streak,
    daily,
  };
};

const remove = async (userId, id) => {
  return LearningRecord.deleteOne({ _id: id, userId });
};

module.exports = { create, list, summary, remove };
