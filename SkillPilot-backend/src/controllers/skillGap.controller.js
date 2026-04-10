const asyncHandler = require('../middlewares/asyncHandler');
const service = require('../services/skillGap.service');

const analyze = asyncHandler(async (req, res) => {
  const data = await service.analyze(req.userId);
  res.json({ success: true, data });
});

module.exports = { analyze };
