const asyncHandler = require('../middlewares/asyncHandler');
const dashboardService = require('../services/dashboard.service');

const getDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboard(req.userId);
  res.json({ success: true, data });
});

module.exports = { getDashboard };
