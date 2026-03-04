const { Certification, Goal } = require('../models/mysql');
const RoadmapData = require('../models/mongodb/RoadmapData');
const aiService = require('./ai.service');
const ApiError = require('../utils/ApiError');
// No external uuid dependency needed; generateId uses timestamp

const generateId = () => `week-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

const generate = async (userId, { certificationId, priority }) => {
  const certification = await Certification.findByPk(certificationId);
  if (!certification) {
    throw ApiError.notFound('자격증을 찾을 수 없습니다');
  }

  const goal = await Goal.findOne({ where: { user_id: userId } });
  const period = goal?.period || '8주';

  const aiWeeks = await aiService.generateRoadmap(
    userId,
    certification.toJSON(),
    priority || '보통',
    period
  );

  // Parse AI response into weeks
  let weeks = [];
  if (Array.isArray(aiWeeks)) {
    weeks = aiWeeks.map((w, i) => ({
      weekId: w.weekId || generateId(),
      title: w.title,
      goal: w.goal || '',
      time: w.time || '',
      materials: w.materials || [],
      order: w.order || i + 1,
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
