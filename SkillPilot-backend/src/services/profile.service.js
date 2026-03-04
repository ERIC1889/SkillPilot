const { Profile } = require('../models/mysql');
const ApiError = require('../utils/ApiError');

const setup = async (userId, data) => {
  const existing = await Profile.findOne({ where: { user_id: userId } });
  if (existing) {
    throw ApiError.conflict('프로필이 이미 존재합니다');
  }

  const profile = await Profile.create({ user_id: userId, ...data });
  return profile;
};

const get = async (userId) => {
  const profile = await Profile.findOne({ where: { user_id: userId } });
  if (!profile) {
    throw ApiError.notFound('프로필을 찾을 수 없습니다');
  }
  return profile;
};

const update = async (userId, data) => {
  const profile = await Profile.findOne({ where: { user_id: userId } });
  if (!profile) {
    throw ApiError.notFound('프로필을 찾을 수 없습니다');
  }

  await profile.update(data);
  return profile;
};

module.exports = { setup, get, update };
