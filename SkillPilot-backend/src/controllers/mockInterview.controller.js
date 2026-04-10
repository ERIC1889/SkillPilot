const asyncHandler = require('../middlewares/asyncHandler');
const service = require('../services/mockInterview.service');

const start = asyncHandler(async (req, res) => {
  const data = await service.start(req.userId, req.body);
  res.status(201).json({ success: true, data });
});

const answer = asyncHandler(async (req, res) => {
  const data = await service.answer(req.userId, req.params.sessionId, req.body);
  res.json({ success: true, data });
});

const get = asyncHandler(async (req, res) => {
  const data = await service.getSession(req.userId, req.params.sessionId);
  res.json({ success: true, data });
});

const list = asyncHandler(async (req, res) => {
  const data = await service.listSessions(req.userId);
  res.json({ success: true, data });
});

module.exports = { start, answer, get, list };
