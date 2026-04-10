const { Certification, Goal, Schedule } = require('../models/mysql');
const RoadmapData = require('../models/mongodb/RoadmapData');
const aiService = require('./ai.service');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');
// No external uuid dependency needed; generateId uses timestamp

const generateId = () => `week-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

const generate = async (userId, { certificationId, priority }) => {
  const certification = await Certification.findByPk(certificationId);
  if (!certification) {
    throw ApiError.notFound('자격증을 찾을 수 없습니다');
  }

  const goal = await Goal.findOne({ where: { user_id: userId } });
  const period = goal?.period || '8주';

  let weeks = [];
  try {
    const aiWeeks = await aiService.generateRoadmap(
      userId,
      certification.toJSON(),
      priority || '보통',
      period
    );

    if (Array.isArray(aiWeeks)) {
      weeks = aiWeeks.map((w, i) => ({
        weekId: w.weekId || generateId(),
        title: w.title || `${i + 1}주차`,
        goal: w.goal || '',
        time: w.time || '',
        materials: Array.isArray(w.materials) ? w.materials : [],
        order: w.order || i + 1,
      }));
    }
  } catch (aiErr) {
    console.warn('AI roadmap generation failed, using default:', aiErr.message);
    // Generate default roadmap based on period
    const weekCount = parseInt(period) || 8;
    const certTitle = certification.title;
    weeks = Array.from({ length: weekCount }, (_, i) => ({
      weekId: generateId(),
      title: `${i + 1}주차: ${certTitle} 학습`,
      goal: i === 0 ? '기초 개념 학습' : i < Math.floor(weekCount / 2) ? '핵심 이론 학습' : i < weekCount - 1 ? '문제 풀이 및 실습' : '최종 정리 및 모의고사',
      time: '하루 2시간 / 주 5일',
      materials: [],
      order: i + 1,
    }));
  }

  // Upsert roadmap
  let roadmap = await RoadmapData.findOne({ userId, certificationId });
  if (roadmap) {
    roadmap.weeks = weeks;
    roadmap.priority = priority || '보통';
    await roadmap.save();
  } else {
    roadmap = await RoadmapData.create({
      userId,
      certificationId,
      priority: priority || '보통',
      weeks,
    });
  }

  // Sync roadmap weeks to calendar schedules
  try {
    // Remove previously generated roadmap schedules for this certification
    await Schedule.destroy({
      where: {
        user_id: userId,
        event: { [Op.like]: `[로드맵] %` },
      },
    });

    // Create schedule entries for each week starting from next Monday
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
    const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + daysUntilMonday);

    const scheduleEntries = weeks.map((week, i) => {
      const weekDate = new Date(startDate);
      weekDate.setDate(startDate.getDate() + i * 7);
      return {
        user_id: userId,
        date: weekDate.toISOString().split('T')[0],
        goal: week.goal || week.title,
        amount: week.time || '',
        event: `[로드맵] ${week.title}`,
        status: '예정',
      };
    });

    await Schedule.bulkCreate(scheduleEntries);
  } catch (syncErr) {
    console.warn('Failed to sync roadmap to calendar:', syncErr.message);
  }

  return roadmap;
};

const get = async (userId) => {
  const roadmaps = await RoadmapData.find({ userId });
  return roadmaps;
};

const reorder = async (userId, weekOrder) => {
  const roadmap = await RoadmapData.findOne({ userId });
  if (!roadmap) {
    throw ApiError.notFound('로드맵을 찾을 수 없습니다');
  }

  // Reorder weeks based on weekOrder array
  const weekMap = new Map(roadmap.weeks.map((w) => [w.weekId, w]));
  roadmap.weeks = weekOrder.map((weekId, i) => {
    const week = weekMap.get(weekId);
    if (week) {
      week.order = i + 1;
      return week;
    }
    return null;
  }).filter(Boolean);

  await roadmap.save();
  return roadmap;
};

const addWeek = async (userId, data) => {
  const roadmap = await RoadmapData.findOne({ userId });
  if (!roadmap) {
    throw ApiError.notFound('로드맵을 찾을 수 없습니다');
  }

  const newWeek = {
    weekId: generateId(),
    title: data.title,
    goal: data.goal || '',
    time: data.time || '',
    materials: data.materials || [],
    order: roadmap.weeks.length + 1,
  };

  roadmap.weeks.push(newWeek);
  await roadmap.save();
  return roadmap;
};

const updateWeek = async (userId, weekId, data) => {
  const roadmap = await RoadmapData.findOne({ userId });
  if (!roadmap) {
    throw ApiError.notFound('로드맵을 찾을 수 없습니다');
  }

  const week = roadmap.weeks.find((w) => w.weekId === weekId);
  if (!week) {
    throw ApiError.notFound('주차를 찾을 수 없습니다');
  }

  Object.assign(week, data);
  await roadmap.save();
  return roadmap;
};

const deleteWeek = async (userId, weekId) => {
  const roadmap = await RoadmapData.findOne({ userId });
  if (!roadmap) {
    throw ApiError.notFound('로드맵을 찾을 수 없습니다');
  }

  roadmap.weeks = roadmap.weeks.filter((w) => w.weekId !== weekId);
  // Recalculate order
  roadmap.weeks.forEach((w, i) => { w.order = i + 1; });
  await roadmap.save();
  return roadmap;
};

const updatePriority = async (userId, { certificationId, priority }) => {
  const roadmap = await RoadmapData.findOne({ userId, certificationId });
  if (!roadmap) {
    throw ApiError.notFound('로드맵을 찾을 수 없습니다');
  }

  roadmap.priority = priority;
  await roadmap.save();
  return roadmap;
};

module.exports = { generate, get, reorder, addWeek, updateWeek, deleteWeek, updatePriority };
