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

const summary = async (userId) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const [monthRecords, weekRecords] = await Promise.all([
    LearningRecord.find({ userId, date: { $gte: monthStart } }),
    LearningRecord.find({ userId, date: { $gte: weekStart } }),
  ]);

  const sum = (rs) => rs.reduce((a, r) => a + (r.studyHours || 0), 0);

  return {
    monthHours: sum(monthRecords),
    weekHours: sum(weekRecords),
    monthCount: monthRecords.length,
    weekCount: weekRecords.length,
  };
};

const remove = async (userId, id) => {
  return LearningRecord.deleteOne({ _id: id, userId });
};

module.exports = { create, list, summary, remove };
