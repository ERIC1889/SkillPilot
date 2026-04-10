const {
  Profile, Goal, UserCertification, Portfolio,
  PortfolioSkill, PortfolioProject,
} = require('../models/mysql');
const aiService = require('./ai.service');
const ApiError = require('../utils/ApiError');

/**
 * 사용자의 현재 상태 + 목표 직무 기반 스킬갭 분석
 */
const analyze = async (userId) => {
  const [profile, goal] = await Promise.all([
    Profile.findOne({ where: { user_id: userId } }),
    Goal.findOne({ where: { user_id: userId } }),
  ]);

  if (!goal) throw ApiError.badRequest('목표 직무가 설정되지 않았습니다');

  const targetRole = goal.custom_role || (
    Array.isArray(goal.target_roles) && goal.target_roles.length > 0
      ? goal.target_roles[0]
      : null
  ) || '개발자';

  const userCerts = await UserCertification.findAll({
    where: { user_id: userId },
    include: [{ association: 'certification' }],
  });
  const certifications = userCerts
    .map((uc) => uc.certification?.title)
    .filter(Boolean);

  const portfolio = await Portfolio.findOne({
    where: { user_id: userId },
    include: [
      { association: 'skills' },
      { association: 'projects' },
    ],
  });

  const currentSkills = portfolio?.skills?.map((s) => s.skill_name) || [];
  // tech_stack 도 스킬 후보로 추가
  if (Array.isArray(goal.tech_stack)) {
    for (const t of goal.tech_stack) {
      if (!currentSkills.includes(t)) currentSkills.push(t);
    }
  }
  const projectTitles = portfolio?.projects?.map((p) => p.title) || [];

  const result = await aiService.analyzeSkillGap({
    targetRole,
    currentSkills,
    certifications,
    projects: projectTitles,
  });

  return {
    ...result,
    targetRole,
    currentSkills,
    certifications,
  };
};

module.exports = { analyze };
