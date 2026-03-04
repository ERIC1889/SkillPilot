const bcrypt = require('bcryptjs');
const { User } = require('../models/mysql');
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

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
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

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  };
};

const getMe = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'name', 'email', 'created_at'],
  });
  if (!user) {
    throw ApiError.notFound('사용자를 찾을 수 없습니다');
  }
  return user;
};

module.exports = { register, login, getMe };
