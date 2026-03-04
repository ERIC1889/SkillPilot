const asyncHandler = require('../middlewares/asyncHandler');
const certService = require('../services/certification.service');

const getAll = asyncHandler(async (req, res) => {
  const certs = await certService.getAll();
  res.json({ success: true, data: certs });
});

const getById = asyncHandler(async (req, res) => {
  const cert = await certService.getById(req.params.id);
  res.json({ success: true, data: cert });
});

const getRankings = asyncHandler(async (req, res) => {
  const rankings = await certService.getRankings();
  res.json({ success: true, data: rankings });
});

const getRecommended = asyncHandler(async (req, res) => {
  const recommendations = await certService.getRecommended(req.userId);
  res.json({ success: true, data: recommendations });
});

const selectCertifications = asyncHandler(async (req, res) => {
  const result = await certService.selectCertifications(
    req.userId,
    req.body.certificationIds
  );
  res.json({ success: true, data: result });
});

module.exports = { getAll, getById, getRankings, getRecommended, selectCertifications };
