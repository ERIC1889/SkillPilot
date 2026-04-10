const config = require('../config');
const ApiError = require('../utils/ApiError');

/**
 * 관리자 API 인증 미들웨어
 * 헤더: X-Admin-Key: <ADMIN_API_KEY>
 *
 * 정식 RBAC 이 없는 현 상태에서 data.go.kr 동기화, 문제 생성 등
 * 위험한 운영 엔드포인트를 보호하기 위한 단순 가드입니다.
 */
const adminAuth = (req, res, next) => {
  if (!config.adminApiKey) {
    throw ApiError.forbidden('ADMIN_API_KEY 가 서버에 설정되지 않았습니다');
  }
  const provided = req.headers['x-admin-key'];
  if (provided !== config.adminApiKey) {
    throw ApiError.forbidden('관리자 권한이 필요합니다');
  }
  next();
};

module.exports = adminAuth;
