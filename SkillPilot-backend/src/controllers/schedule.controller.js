const asyncHandler = require('../middlewares/asyncHandler');
const scheduleService = require('../services/schedule.service');

const get = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;
  const schedules = await scheduleService.getByMonth(req.userId, year, month);
  res.json({ success: true, data: schedules });
});

const create = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.create(req.userId, req.body);
  res.status(201).json({ success: true, data: schedule });
});

const update = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.update(
    req.userId,
    req.params.id,
    req.body
  );
  res.json({ success: true, data: schedule });
});

const remove = asyncHandler(async (req, res) => {
  await scheduleService.remove(req.userId, req.params.id);
  res.json({ success: true, message: '일정이 삭제되었습니다' });
});

module.exports = { get, create, update, remove };
