const asyncHandler = require('../middlewares/asyncHandler');
const portfolioService = require('../services/portfolio.service');

const getFull = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.getFull(req.userId);
  res.json({ success: true, data: portfolio });
});

const updateIntro = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.updateIntro(req.userId, req.body);
  res.json({ success: true, data: portfolio });
});

// Skills
const addSkill = asyncHandler(async (req, res) => {
  const skill = await portfolioService.addSkill(req.userId, req.body);
  res.status(201).json({ success: true, data: skill });
});

const deleteSkill = asyncHandler(async (req, res) => {
  await portfolioService.deleteSkill(req.userId, req.params.id);
  res.json({ success: true, message: '스킬이 삭제되었습니다' });
});

// Certs
const addCert = asyncHandler(async (req, res) => {
  const cert = await portfolioService.addCert(req.userId, req.body);
  res.status(201).json({ success: true, data: cert });
});

const deleteCert = asyncHandler(async (req, res) => {
  await portfolioService.deleteCert(req.userId, req.params.id);
  res.json({ success: true, message: '자격증이 삭제되었습니다' });
});

// Projects
const addProject = asyncHandler(async (req, res) => {
  const project = await portfolioService.addProject(req.userId, req.body);
  res.status(201).json({ success: true, data: project });
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await portfolioService.updateProject(
    req.userId, req.params.id, req.body
  );
  res.json({ success: true, data: project });
});

const deleteProject = asyncHandler(async (req, res) => {
  await portfolioService.deleteProject(req.userId, req.params.id);
  res.json({ success: true, message: '프로젝트가 삭제되었습니다' });
});

// Links
const updateLinks = asyncHandler(async (req, res) => {
  const links = await portfolioService.updateLinks(req.userId, req.body.links);
  res.json({ success: true, data: links });
});

// Activities
const addActivity = asyncHandler(async (req, res) => {
  const activity = await portfolioService.addActivity(req.userId, req.body);
  res.status(201).json({ success: true, data: activity });
});

const updateActivity = asyncHandler(async (req, res) => {
  const activity = await portfolioService.updateActivity(
    req.userId, req.params.id, req.body
  );
  res.json({ success: true, data: activity });
});

const deleteActivity = asyncHandler(async (req, res) => {
  await portfolioService.deleteActivity(req.userId, req.params.id);
  res.json({ success: true, message: '활동이 삭제되었습니다' });
});

// Etc
const updateEtc = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.updateEtc(req.userId, req.body);
  res.json({ success: true, data: portfolio });
});

// Preview
const getPreview = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.getPreview(req.params.userId);
  res.json({ success: true, data: portfolio });
});

module.exports = {
  getFull, updateIntro,
  addSkill, deleteSkill,
  addCert, deleteCert,
  addProject, updateProject, deleteProject,
  updateLinks,
  addActivity, updateActivity, deleteActivity,
  updateEtc, getPreview,
};
