const asyncHandler = require('../middlewares/asyncHandler');
const noticeService = require('../services/notice.service');

const list = asyncHandler(async (req, res) => {
  const data = await noticeService.list(req.query);
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await noticeService.create(req.body);
  res.status(201).json({ success: true, data });
});

const remove = asyncHandler(async (req, res) => {
  await noticeService.remove(req.params.id);
  res.json({ success: true });
});

module.exports = { list, create, remove };
