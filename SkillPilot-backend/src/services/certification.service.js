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

    // AI 추천 결과에서 title로 DB 자격증 매칭
    if (Array.isArray(recommendations) && recommendations.length > 0) {
      const titles = recommendations.map(r => r.title);
      const { Op } = require('sequelize');
      const matched = await Certification.findAll({
        where: { title: { [Op.in]: titles } },
      });

      if (matched.length > 0) {
        return matched;
      }
    }

    // 매칭 실패 시 인기순 반환
    return Certification.findAll({ order: [['popularity', 'DESC']], limit: 5 });
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

/**
 * 필터 UI 에 쓸 분야/레벨 옵션 반환
 */
const getFilterOptions = async () => {
  const certs = await Certification.findAll({
    attributes: ['level', 'field'],
  });
  const levels = Array.from(new Set(certs.map((c) => c.level).filter(Boolean)));
  const fields = Array.from(new Set(certs.map((c) => c.field).filter(Boolean)));
  return { levels, fields };
};

module.exports = {
  getAll,
  getById,
  getRankings,
  getRecommended,
  selectCertifications,
  getFilterOptions,
};
