/**
 * 애플리케이션 스케줄러
 *
 * 서버 시작 시 start() 를 호출해 백그라운드 크론을 등록합니다.
 * SCHEDULER_ENABLED=false 이면 건너뜁니다.
 */

const cron = require('node-cron');
const config = require('../config');
const certSyncService = require('../services/certificationSync.service');
const { hasAnyKey } = require('../integrations/dataGoKr/endpoints');

let registered = [];

const start = () => {
  if (!config.scheduler.enabled) {
    console.log('[scheduler] disabled via SCHEDULER_ENABLED=false');
    return;
  }

  if (!hasAnyKey()) {
    console.warn('[scheduler] data.go.kr 서비스 키가 하나도 설정되지 않음 — 스케줄러 등록 생략');
    return;
  }

  // 자격증 정보 동기화
  const certJob = cron.schedule(
    config.scheduler.certificationSyncCron,
    async () => {
      console.log('[scheduler] certification sync tick');
      try {
        await certSyncService.syncCertifications();
      } catch (err) {
        console.error('[scheduler] cert sync error:', err.message);
      }
    },
    { timezone: 'Asia/Seoul' }
  );
  registered.push(certJob);

  // 시험일정 동기화
  const examJob = cron.schedule(
    config.scheduler.examScheduleSyncCron,
    async () => {
      console.log('[scheduler] exam schedule sync tick');
      try {
        await certSyncService.syncExamSchedules();
      } catch (err) {
        console.error('[scheduler] exam sync error:', err.message);
      }
    },
    { timezone: 'Asia/Seoul' }
  );
  registered.push(examJob);

  console.log(
    `[scheduler] started — cert: ${config.scheduler.certificationSyncCron}, exam: ${config.scheduler.examScheduleSyncCron}`
  );
};

const stop = () => {
  registered.forEach((job) => job.stop());
  registered = [];
};

module.exports = { start, stop };
