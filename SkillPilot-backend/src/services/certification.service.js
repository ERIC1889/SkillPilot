const { Certification, UserCertification, Profile, Goal } = require('../models/mysql');
const aiService = require('./ai.service');
const ApiError = require('../utils/ApiError');

const getAll = async () => {
  return Certification.findAll({ order: [['popularity', 'DESC']] });
};

const getById = async (id) => {
  const cert = await Certification.findByPk(id, {
    include: [{ association: 'examSchedules' }],
  });
  if (!cert) {
    throw ApiError.notFound('자격증을 찾을 수 없습니다');
  }
  return cert;
};

const getRankings = async () => {
  return Certification.findAll({
    order: [['popularity', 'DESC']],
    limit: 10,
  });
};

const getRecommended = async (userId) => {
  const profile = await Profile.findOne({ where: { user_id: userId } });
  const goal = await Goal.findOne({ where: { user_id: userId } });

  if (!profile || !goal) {
    // 프로필/목표 미설정 시 인기순 자격증 반환
    return Certification.findAll({ order: [['popularity', 'DESC']], limit: 5 });
  }

  try {
    const recommendations = await aiService.recommendCertifications(
      userId,
      profile.toJSON(),
      goal.toJSON()
    );
    return recommendations;
  } catch {
    // AI 서비스 실패 시 인기순 자격증 반환
    return Certification.findAll({ order: [['popularity', 'DESC']], limit: 5 });
  }
};

const selectCertifications = async (userId, certificationIds) => {
  // Remove existing selections
  await UserCertification.destroy({ where: { user_id: userId } });

  // Create new selections
  const records = certificationIds.map((certId) => ({
    user_id: userId,
    certification_id: certId,
    status: '준비중',
  }));

  await UserCertification.bulkCreate(records);

  // Increment popularity
  await Certification.increment('popularity', {
    where: { id: certificationIds },
  });

  return UserCertification.findAll({
    where: { user_id: userId },
    include: [{ association: 'certification' }],
  });
};

module.exports = { getAll, getById, getRankings, getRecommended, selectCertifications };
