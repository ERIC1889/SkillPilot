const { Op } = require('sequelize');
const { Job, UserCertification, Goal, Portfolio, PortfolioSkill } = require('../models/mysql');

const list = async ({ roleCategory, limit = 20 } = {}) => {
  const where = { active: true };
  if (roleCategory) where.role_category = roleCategory;
  return Job.findAll({ where, order: [['createdAt', 'DESC']], limit: Number(limit) });
};

/**
 * 사용자 맞춤 채용 매칭:
 *  - 보유 자격증 / 목표 직무 / 포트폴리오 스킬과 교집합을 계산해 match_score 산출
 */
const matchForUser = async (userId) => {
  const jobs = await Job.findAll({ where: { active: true } });
  if (jobs.length === 0) return [];

  const [userCerts, goal, portfolio] = await Promise.all([
    UserCertification.findAll({
      where: { user_id: userId },
      include: [{ association: 'certification' }],
    }),
    Goal.findOne({ where: { user_id: userId } }),
    Portfolio.findOne({
      where: { user_id: userId },
      include: [{ association: 'skills' }],
    }),
  ]);

  const certTitles = new Set(
    userCerts.map((uc) => uc.certification?.title).filter(Boolean)
  );
  const userSkills = new Set([
    ...(portfolio?.skills?.map((s) => s.skill_name) || []),
    ...((Array.isArray(goal?.tech_stack) ? goal.tech_stack : [])),
  ]);
  const targetRoles = new Set(
    Array.isArray(goal?.target_roles) ? goal.target_roles : []
  );
  if (goal?.custom_role) targetRoles.add(goal.custom_role);

  const normalized = (s) => String(s || '').toLowerCase().replace(/\s+/g, '');
  const userSkillsNorm = new Set(Array.from(userSkills).map(normalized));
  const certsNorm = new Set(Array.from(certTitles).map(normalized));

  const scored = jobs.map((job) => {
    const required = Array.isArray(job.required_skills) ? job.required_skills : [];
    const preferredCerts = Array.isArray(job.preferred_certifications) ? job.preferred_certifications : [];

    const skillMatches = required.filter((s) => userSkillsNorm.has(normalized(s))).length;
    const certMatches = preferredCerts.filter((c) => certsNorm.has(normalized(c))).length;

    const skillScore = required.length > 0 ? (skillMatches / required.length) * 70 : 0;
    const certScore = preferredCerts.length > 0 ? (certMatches / preferredCerts.length) * 20 : 0;
    const roleScore = targetRoles.size > 0 && job.role_category
      && Array.from(targetRoles).some((r) => normalized(r) === normalized(job.role_category))
      ? 10
      : 0;

    const matchScore = Math.round(skillScore + certScore + roleScore);

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      location: job.location,
      employment_type: job.employment_type,
      required_skills: required,
      preferred_certifications: preferredCerts,
      role_category: job.role_category,
      url: job.url,
      match_score: matchScore,
    };
  });

  return scored.sort((a, b) => b.match_score - a.match_score);
};

module.exports = { list, matchForUser };
