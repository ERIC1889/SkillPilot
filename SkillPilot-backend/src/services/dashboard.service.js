const { Schedule, UserCertification } = require('../models/mysql');
const TestResult = require('../models/mongodb/TestResult');
const RoadmapData = require('../models/mongodb/RoadmapData');
const LearningRecord = require('../models/mongodb/LearningRecord');
const { Op } = require('sequelize');

const getDashboard = async (userId) => {
  // Selected certifications count
  const certCount = await UserCertification.count({
    where: { user_id: userId },
  });

  // Upcoming schedules (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const upcomingSchedules = await Schedule.findAll({
    where: {
      user_id: userId,
      date: {
        [Op.between]: [
          today.toISOString().split('T')[0],
          nextWeek.toISOString().split('T')[0],
        ],
      },
      status: '예정',
    },
    order: [['date', 'ASC']],
    limit: 5,
  });

  // Recent test results
  const recentTests = await TestResult.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5);

  // Roadmap progress
  const roadmaps = await RoadmapData.find({ userId });
  const totalWeeks = roadmaps.reduce((sum, r) => sum + r.weeks.length, 0);

  // Study hours this month
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const records = await LearningRecord.find({
    userId,
    date: { $gte: monthStart },
  });
  const totalStudyHours = records.reduce((sum, r) => sum + r.studyHours, 0);

  return {
    certCount,
    upcomingSchedules,
    recentTests,
    roadmapWeeks: totalWeeks,
    monthlyStudyHours: totalStudyHours,
  };
};

module.exports = { getDashboard };
