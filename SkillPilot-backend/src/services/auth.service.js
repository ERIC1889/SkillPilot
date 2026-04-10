const bcrypt = require('bcryptjs');
const { User, Profile, Goal, UserCertification } = require('../models/mysql');
const RoadmapData = require('../models/mongodb/RoadmapData');
const { generateToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw ApiError.conflict('이미 사용 중인 이메일입니다');
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  const token = generateToken(user.id);
  const onboarding = await getOnboardingStatus(user.id);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
    onboarding,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized('이메일 또는 비밀번호가 올바르지 않습니다');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized('이메일 또는 비밀번호가 올바르지 않습니다');
  }

  const token = generateToken(user.id);
  const onboarding = await getOnboardingStatus(user.id);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
    onboarding,
  };
};

/**
 * 온보딩 단계별 완료 여부 계산
 * - profile: Profile 존재
 * - goal: Goal 존재
 * - certSelected: UserCertification 1건 이상
 * - roadmap: RoadmapData 1건 이상 (MongoDB 불가 시 false)
 */
const getOnboardingStatus = async (userId) => {
  const [profile, goal, certCount] = await Promise.all([
    Profile.findOne({ where: { user_id: userId } }),
    Goal.findOne({ where: { user_id: userId } }),
    UserCertification.count({ where: { user_id: userId } }),
  ]);

  let roadmap = false;
  try {
    const rd = await RoadmapData.findOne({ userId });
    roadmap = !!rd;
  } catch {
    roadmap = false;
  }

  const steps = {
    profile: !!profile,
    goal: !!goal,
    certSelected: certCount > 0,
    roadmap,
  };

  // 다음으로 이동해야 할 스텝
  let nextStep = 'dashboard';
  if (!steps.profile) nextStep = 'profile';
  else if (!steps.goal) nextStep = 'goal';
  else if (!steps.certSelected) nextStep = 'certification';
  else if (!steps.roadmap) nextStep = 'roadmap';

  return {
    ...steps,
    complete: steps.profile && steps.goal && steps.certSelected && steps.roadmap,
    nextStep,
  };
};

const getMe = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'name', 'email', 'created_at'],
  });
  if (!user) {
    throw ApiError.notFound('사용자를 찾을 수 없습니다');
  }
  const onboarding = await getOnboardingStatus(userId);
  return {
    user: { id: user.id, name: user.name, email: user.email },
    onboarding,
  };
};

module.exports = { register, login, getMe, getOnboardingStatus };
