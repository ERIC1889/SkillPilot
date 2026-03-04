const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('토큰이 제공되지 않았습니다');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.id;
    next();
  } catch (err) {
    throw ApiError.unauthorized('유효하지 않은 토큰입니다');
  }
};

module.exports = auth;
