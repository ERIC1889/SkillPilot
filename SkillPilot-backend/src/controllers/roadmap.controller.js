const asyncHandler = require('../middlewares/asyncHandler');
const roadmapService = require('../services/roadmap.service');

const generate = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.generate(req.userId, req.body);
  res.status(201).json({ success: true, data: roadmap });
});

const get = asyncHandler(async (req, res) => {
  const roadmaps = await roadmapService.get(req.userId);
  res.json({ success: true, data: roadmaps });
});

const reorder = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.reorder(req.userId, req.body.weekOrder);
  res.json({ success: true, data: roadmap });
});

const addWeek = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.addWeek(req.userId, req.body);
  res.status(201).json({ success: true, data: roadmap });
});

const updateWeek = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.updateWeek(
    req.userId,
    req.params.weekId,
    req.body
  );
  res.json({ success: true, data: roadmap });
});

const deleteWeek = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.deleteWeek(req.userId, req.params.weekId);
  res.json({ success: true, data: roadmap });
});

const updatePriority = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.updatePriority(req.userId, req.body);
  res.json({ success: true, data: roadmap });
});

module.exports = { generate, get, reorder, addWeek, updateWeek, deleteWeek, updatePriority };
