const {
  Portfolio, PortfolioSkill, PortfolioCert, PortfolioProject,
  PortfolioLink, PortfolioActivity, User,
} = require('../models/mysql');
const ApiError = require('../utils/ApiError');

const getOrCreatePortfolio = async (userId) => {
  let portfolio = await Portfolio.findOne({ where: { user_id: userId } });
  if (!portfolio) {
    const user = await User.findByPk(userId);
    portfolio = await Portfolio.create({
      user_id: userId,
      name: user?.name || '',
    });
  }
  return portfolio;
};

const getFull = async (userId) => {
  const portfolio = await getOrCreatePortfolio(userId);

  return Portfolio.findByPk(portfolio.id, {
    include: [
      { association: 'skills' },
      { association: 'certs' },
      { association: 'projects' },
      { association: 'links' },
      { association: 'activities' },
    ],
  });
};

const updateIntro = async (userId, data) => {
  const portfolio = await getOrCreatePortfolio(userId);
  await portfolio.update(data);
  return portfolio;
};

// Skills
const addSkill = async (userId, data) => {
  const portfolio = await getOrCreatePortfolio(userId);
  return PortfolioSkill.create({ portfolio_id: portfolio.id, ...data });
};

const deleteSkill = async (userId, skillId) => {
  const portfolio = await getOrCreatePortfolio(userId);
  const skill = await PortfolioSkill.findOne({
    where: { id: skillId, portfolio_id: portfolio.id },
  });
  if (!skill) throw ApiError.notFound('스킬을 찾을 수 없습니다');
  await skill.destroy();
};

// Certs
const addCert = async (userId, data) => {
  const portfolio = await getOrCreatePortfolio(userId);
  return PortfolioCert.create({ portfolio_id: portfolio.id, ...data });
};

const deleteCert = async (userId, certId) => {
  const portfolio = await getOrCreatePortfolio(userId);
  const cert = await PortfolioCert.findOne({
    where: { id: certId, portfolio_id: portfolio.id },
  });
  if (!cert) throw ApiError.notFound('자격증을 찾을 수 없습니다');
  await cert.destroy();
};

// Projects
const addProject = async (userId, data) => {
  const portfolio = await getOrCreatePortfolio(userId);
  return PortfolioProject.create({ portfolio_id: portfolio.id, ...data });
};

const updateProject = async (userId, projectId, data) => {
  const portfolio = await getOrCreatePortfolio(userId);
  const project = await PortfolioProject.findOne({
    where: { id: projectId, portfolio_id: portfolio.id },
  });
  if (!project) throw ApiError.notFound('프로젝트를 찾을 수 없습니다');
  await project.update(data);
  return project;
};

const deleteProject = async (userId, projectId) => {
  const portfolio = await getOrCreatePortfolio(userId);
  const project = await PortfolioProject.findOne({
    where: { id: projectId, portfolio_id: portfolio.id },
  });
  if (!project) throw ApiError.notFound('프로젝트를 찾을 수 없습니다');
  await project.destroy();
};

// Links
const updateLinks = async (userId, links) => {
  const portfolio = await getOrCreatePortfolio(userId);

  // Replace all links
  await PortfolioLink.destroy({ where: { portfolio_id: portfolio.id } });
  const newLinks = links.map((link) => ({
    portfolio_id: portfolio.id,
    ...link,
  }));
  await PortfolioLink.bulkCreate(newLinks);

  return PortfolioLink.findAll({ where: { portfolio_id: portfolio.id } });
};

// Activities
const addActivity = async (userId, data) => {
  const portfolio = await getOrCreatePortfolio(userId);
  return PortfolioActivity.create({ portfolio_id: portfolio.id, ...data });
};

const updateActivity = async (userId, activityId, data) => {
  const portfolio = await getOrCreatePortfolio(userId);
  const activity = await PortfolioActivity.findOne({
    where: { id: activityId, portfolio_id: portfolio.id },
  });
  if (!activity) throw ApiError.notFound('활동을 찾을 수 없습니다');
  await activity.update(data);
  return activity;
};

const deleteActivity = async (userId, activityId) => {
  const portfolio = await getOrCreatePortfolio(userId);
  const activity = await PortfolioActivity.findOne({
    where: { id: activityId, portfolio_id: portfolio.id },
  });
  if (!activity) throw ApiError.notFound('활동을 찾을 수 없습니다');
  await activity.destroy();
};

// Etc
const updateEtc = async (userId, data) => {
  const portfolio = await getOrCreatePortfolio(userId);
  await portfolio.update({ etc_content: data.etc_content });
  return portfolio;
};

// Public preview
const getPreview = async (userId) => {
  const portfolio = await Portfolio.findOne({
    where: { user_id: userId },
    include: [
      { association: 'skills' },
      { association: 'certs' },
      { association: 'projects' },
      { association: 'links' },
      { association: 'activities' },
    ],
  });
  if (!portfolio) throw ApiError.notFound('포트폴리오를 찾을 수 없습니다');
  return portfolio;
};

module.exports = {
  getFull, updateIntro,
  addSkill, deleteSkill,
  addCert, deleteCert,
  addProject, updateProject, deleteProject,
  updateLinks,
  addActivity, updateActivity, deleteActivity,
  updateEtc, getPreview,
};
