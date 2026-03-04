class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message) {
    return new ApiError(400, message);
  }

  static unauthorized(message = '인증이 필요합니다') {
    return new ApiError(401, message);
  }

  static forbidden(message = '권한이 없습니다') {
    return new ApiError(403, message);
  }

  static notFound(message = '리소스를 찾을 수 없습니다') {
    return new ApiError(404, message);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }

  static internal(message = '서버 내부 오류가 발생했습니다') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
