const { Goal } = require('../models/mysql');
const ApiError = require('../utils/ApiError');

const createOrUpdate = async (userId, data) => {
  let goal = await Goal.findOne({ where: { user_id: userId } });

  if (goal) {
    await goal.update(data);
  } else {
    goal = await Goal.create({ user_id: userId, ...data });
  }

  return goal;
};

const get = async (userId) => {
  const goal = await Goal.findOne({ where: { user_id: userId } });
  if (!goal) {
    throw ApiError.notFound('목표를 찾을 수 없습니다');
  }
  return goal;
};

module.exports = { createOrUpdate, get };
