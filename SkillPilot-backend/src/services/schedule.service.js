const { Op } = require('sequelize');
const { Schedule } = require('../models/mysql');
const ApiError = require('../utils/ApiError');

const getByMonth = async (userId, year, month) => {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0); // last day of month
  const endStr = `${year}-${String(month).padStart(2, '0')}-${endDate.getDate()}`;

  return Schedule.findAll({
    where: {
      user_id: userId,
      date: { [Op.between]: [startDate, endStr] },
    },
    order: [['date', 'ASC']],
  });
};

const create = async (userId, data) => {
  return Schedule.create({ user_id: userId, ...data });
};

const update = async (userId, id, data) => {
  const schedule = await Schedule.findOne({
    where: { id, user_id: userId },
  });
  if (!schedule) {
    throw ApiError.notFound('일정을 찾을 수 없습니다');
  }

  await schedule.update(data);
  return schedule;
};

const remove = async (userId, id) => {
  const schedule = await Schedule.findOne({
    where: { id, user_id: userId },
  });
  if (!schedule) {
    throw ApiError.notFound('일정을 찾을 수 없습니다');
  }

  await schedule.destroy();
};

module.exports = { getByMonth, create, update, remove };
