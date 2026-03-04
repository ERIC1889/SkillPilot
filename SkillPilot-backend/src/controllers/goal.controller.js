const asyncHandler = require('../middlewares/asyncHandler');
const goalService = require('../services/goal.service');

const createOrUpdate = asyncHandler(async (req, res) => {
  const goal = await goalService.createOrUpdate(req.userId, req.body);
  res.json({ success: true, data: goal });
});

const get = asyncHandler(async (req, res) => {
  const goal = await goalService.get(req.userId);
  res.json({ success: true, data: goal });
});

module.exports = { createOrUpdate, get };
