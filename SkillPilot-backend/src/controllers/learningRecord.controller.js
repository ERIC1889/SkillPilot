const asyncHandler = require('../middlewares/asyncHandler');
const service = require('../services/learningRecord.service');

const create = asyncHandler(async (req, res) => {
  const data = await service.create(req.userId, req.body);
  res.status(201).json({ success: true, data });
});

const list = asyncHandler(async (req, res) => {
  const data = await service.list(req.userId, req.query);
  res.json({ success: true, data });
});

const summary = asyncHandler(async (req, res) => {
  const data = await service.summary(req.userId);
  res.json({ success: true, data });
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.userId, req.params.id);
  res.json({ success: true });
});

module.exports = { create, list, summary, remove };
