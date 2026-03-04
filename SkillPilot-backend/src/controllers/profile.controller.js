const asyncHandler = require('../middlewares/asyncHandler');
const profileService = require('../services/profile.service');

const setup = asyncHandler(async (req, res) => {
  const profile = await profileService.setup(req.userId, req.body);
  res.status(201).json({ success: true, data: profile });
});

const get = asyncHandler(async (req, res) => {
  const profile = await profileService.get(req.userId);
  res.json({ success: true, data: profile });
});

const update = asyncHandler(async (req, res) => {
  const profile = await profileService.update(req.userId, req.body);
  res.json({ success: true, data: profile });
});

module.exports = { setup, get, update };
