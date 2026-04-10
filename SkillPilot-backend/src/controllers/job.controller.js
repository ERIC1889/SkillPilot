const asyncHandler = require('../middlewares/asyncHandler');
const service = require('../services/job.service');

const list = asyncHandler(async (req, res) => {
  const data = await service.list(req.query);
  res.json({ success: true, data });
});

const matches = asyncHandler(async (req, res) => {
  const data = await service.matchForUser(req.userId);
  res.json({ success: true, data });
});

module.exports = { list, matches };
