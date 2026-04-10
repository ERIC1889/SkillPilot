require("dotenv").config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 5000,

  mysql: {
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "skillpilot",
  },

  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/skillpilot",

  jwt: {
    secret: process.env.JWT_SECRET || "default_secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-5-nano-2025-08-07",
  },

  dataGoKr: {
    // 기본(폴백) 키 — 각 API 전용 키가 비어있을 때 사용
    apiKey: process.env.DATA_GO_KR_API_KEY || "",
    // 각 공공데이터 ID 에 대응하는 개별 서비스 키
    keys: {
      "15003024": process.env.DATA_GO_KR_KEY_15003024 || "",
      "15003027": process.env.DATA_GO_KR_KEY_15003027 || "",
      "15003029": process.env.DATA_GO_KR_KEY_15003029 || "",
      "15074408": process.env.DATA_GO_KR_KEY_15074408 || "",
      "15041600": process.env.DATA_GO_KR_KEY_15041600 || "",
      "15039800": process.env.DATA_GO_KR_KEY_15039800 || "",
      "15075141": process.env.DATA_GO_KR_KEY_15075141 || "",
    },
    timeoutMs: parseInt(process.env.DATA_GO_KR_TIMEOUT_MS, 10) || 15000,
  },

  scheduler: {
    enabled: process.env.SCHEDULER_ENABLED !== "false",
    certificationSyncCron: process.env.CRON_CERT_SYNC || "0 4 * * *", // 매일 04:00
    examScheduleSyncCron: process.env.CRON_EXAM_SYNC || "0 5 * * 1", // 매주 월요일 05:00
  },

  adminApiKey: process.env.ADMIN_API_KEY || "",

  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};
