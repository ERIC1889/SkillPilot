/**
 * 자격증 & 시험일정 & 공개문제 동기화 서비스
 *
 * 7개 공공데이터포털 API 를 순회해서 IT 자격증만 DB 에 upsert 합니다.
 *
 * 동기화 파이프라인:
 *   1) 15003024 (종목 목록) → 전체 종목 스캔, IT 필터 적용, 후보 externalCode 수집
 *   2) 15041600 (종목 상세) → 후보 종목의 개요/수행직무/진로 등 병합
 *   3) 15039800 (취득 현황 통계) → 최근 취득자 수 기반 popularity 업데이트
 *   4) 15074408 + 15003029 + 15003027 → ExamSchedule 동기화
 *   5) 15075141 (공개문제) → 문제은행 메타 동기화 (별도 메서드)
 */

const { Op } = require('sequelize');
const { Certification, ExamSchedule } = require('../models/mysql');
const {
  client,
  endpoints,
  hasAnyKey,
  isITCertification,
  normalizeListItem,
  normalizeDetailItem,
  normalizeStatItem,
  normalizeQualExamScheduleItem,
  normalizeEngineerExamItem,
  normalizeProfessionalExamItem,
  normalizeOpenQuestionItem,
} = require('../integrations/dataGoKr');

const log = (...args) => console.log('[certSync]', ...args);
const warn = (...args) => console.warn('[certSync]', ...args);

/**
 * 시리즈 이름(기사/산업기사/기능사/기술사 등) → 대략적인 level 매핑
 */
const inferLevel = (raw) => {
  const s = String(raw || '');
  if (/기술사/.test(s)) return '국가기술';
  if (/기사|산업기사|기능사|기능장/.test(s)) return '국가기술';
  return '국가기술';
};

/**
 * 1단계: 15003024 종목 목록 → IT 자격증 후보 추출
 */
const fetchITCandidates = async () => {
  const ep = endpoints.qualificationList;
  if (!ep.apiKey) {
    warn(`${ep.id} (${ep.description}): 서비스 키 미설정 — 생략`);
    return [];
  }

  try {
    const items = await client.fetchAllPages({
      url: ep.url,
      apiKey: ep.apiKey,
      params: {},
      maxPages: 50,
    });

    const normalized = items.map(normalizeListItem).filter(Boolean);
    const itOnly = normalized.filter((c) =>
      isITCertification({ title: c.title, field: c.field })
    );
    log(`${ep.id} 종목 목록: ${items.length}건 → IT 후보 ${itOnly.length}건`);
    return itOnly;
  } catch (err) {
    warn(`${ep.id} 실패: ${err.message}`);
    return [];
  }
};

/**
 * 2단계: 15041600 종목 상세 → Certification 본문 생성
 * - 15003024 의 externalCode 와 매칭되는 항목만 사용
 */
const fetchDetailForCandidates = async (candidates) => {
  const ep = endpoints.qualificationDetail;
  if (!ep.apiKey) {
    warn(`${ep.id} (${ep.description}): 서비스 키 미설정 — 목록 기반 최소 레코드만 저장`);
    // 상세 API 가 없으면 목록 정보로만 최소한의 레코드 구성
    return candidates.map((c) => ({
      source: 'data.go.kr',
      external_source_id: '15003024',
      external_code: c.externalCode,
      title: c.title,
      level: inferLevel(c.qualKind),
      field: c.field,
      synced_at: new Date(),
    }));
  }

  const candidateCodes = new Set(candidates.map((c) => c.externalCode).filter(Boolean));
  const candidateTitles = new Set(candidates.map((c) => c.title));

  try {
    const items = await client.fetchAllPages({
      url: ep.url,
      apiKey: ep.apiKey,
      params: {},
      maxPages: 50,
    });

    const details = items
      .map((raw) =>
        normalizeDetailItem(raw, {
          sourceId: '15041600',
          levelGuess: '국가기술',
        })
      )
      .filter(Boolean)
      .filter((d) => {
        if (d.external_code && candidateCodes.has(d.external_code)) return true;
        if (candidateTitles.has(d.title)) return true;
        return isITCertification({ title: d.title, field: d.field });
      });

    log(`${ep.id} 상세: ${items.length}건 → 매칭 ${details.length}건`);
    return details;
  } catch (err) {
    warn(`${ep.id} 실패: ${err.message}`);
    return [];
  }
};

/**
 * 3단계: 15039800 취득 현황 → popularity 계산
 */
const mergeStats = async (certs) => {
  const ep = endpoints.qualificationStats;
  if (!ep.apiKey) {
    warn(`${ep.id} 통계 키 미설정 — 병합 생략`);
    return;
  }
  try {
    const items = await client.fetchAllPages({
      url: ep.url,
      apiKey: ep.apiKey,
      maxPages: 30,
    });

    // externalCode 별 최근 취득자수 합산
    const agg = new Map();
    for (const raw of items) {
      const s = normalizeStatItem(raw);
      if (!s || !s.externalCode) continue;
      const cur = agg.get(s.externalCode) || 0;
      agg.set(s.externalCode, cur + (s.givecnt || 0));
    }

    // 최대값 기준으로 0~100 스케일
    const values = Array.from(agg.values());
    const max = values.length > 0 ? Math.max(...values) : 0;

    for (const c of certs) {
      if (c.external_code && agg.has(c.external_code)) {
        const cnt = agg.get(c.external_code);
        c.popularity = max > 0 ? Math.round((cnt / max) * 100) : 0;
      }
    }
    log(`${ep.id} 통계 병합: ${agg.size}종목`);
  } catch (err) {
    warn(`${ep.id} 실패: ${err.message}`);
  }
};

/**
 * 메인: 자격증 전체 동기화
 */
const syncCertifications = async () => {
  if (!hasAnyKey()) {
    warn('data.go.kr 서비스 키가 하나도 설정되지 않아 동기화를 건너뜁니다.');
    return { synced: 0, skipped: true };
  }

  log('자격증 동기화 시작');

  // 1. IT 후보 추출
  const candidates = await fetchITCandidates();
  if (candidates.length === 0) {
    warn('IT 후보가 0건입니다. (15003024 키/응답 확인 필요)');
  }

  // 2. 상세 병합
  const details = await fetchDetailForCandidates(candidates);

  // 3. 후보의 목록 정보(field 등)를 상세에 보강
  const codeToDetail = new Map();
  for (const d of details) {
    if (d.external_code) codeToDetail.set(d.external_code, d);
  }
  // 상세에 없는 후보도 최소 레코드로 포함
  for (const c of candidates) {
    if (!c.externalCode) continue;
    if (!codeToDetail.has(c.externalCode)) {
      codeToDetail.set(c.externalCode, {
        source: 'data.go.kr',
        external_source_id: '15003024',
        external_code: c.externalCode,
        title: c.title,
        level: inferLevel(c.qualKind),
        field: c.field,
        synced_at: new Date(),
      });
    }
  }

  const uniqueCerts = Array.from(codeToDetail.values());
  if (uniqueCerts.length === 0) {
    warn('수신된 IT 자격증이 없습니다.');
    return { synced: 0 };
  }

  // 4. 통계 병합
  await mergeStats(uniqueCerts);

  // 5. DB upsert
  let synced = 0;
  for (const c of uniqueCerts) {
    try {
      const where = c.external_code
        ? { external_code: c.external_code }
        : { title: c.title };

      const existing = await Certification.findOne({ where });
      if (existing) {
        await existing.update(c);
      } else {
        await Certification.create(c);
      }
      synced++;
    } catch (err) {
      warn(`upsert 실패 [${c.title}]: ${err.message}`);
    }
  }

  log(`자격증 동기화 완료: ${synced}/${uniqueCerts.length}건`);
  return { synced, total: uniqueCerts.length };
};

/**
 * 시험일정 동기화 (15074408 + 15003029 + 15003027)
 */
const syncExamSchedules = async () => {
  if (!hasAnyKey()) {
    warn('data.go.kr 서비스 키가 하나도 설정되지 않아 일정 동기화를 건너뜁니다.');
    return { synced: 0, skipped: true };
  }

  log('시험일정 동기화 시작');

  // externalCode → certification_id 조회 캐시 (기술자격용)
  const certs = await Certification.findAll({
    where: { external_code: { [Op.not]: null } },
    attributes: ['id', 'external_code'],
  });
  const codeToId = new Map(certs.map((c) => [c.external_code, c.id]));

  let synced = 0;

  // A. 15074408 — 국가자격 시험일정 조회 서비스 (주요 소스)
  const epA = endpoints.qualExamSchedule;
  if (epA.apiKey) {
    try {
      const items = await client.fetchAllPages({ url: epA.url, apiKey: epA.apiKey, maxPages: 30 });
      for (const raw of items) {
        const s = normalizeQualExamScheduleItem(raw);
        if (!s || !s.externalCode) continue;
        const certId = codeToId.get(s.externalCode);
        if (!certId) continue;
        await upsertSchedule(certId, s);
        synced++;
      }
      log(`${epA.id}: ${items.length}건 수신`);
    } catch (err) {
      warn(`${epA.id} 실패: ${err.message}`);
    }
  } else {
    warn(`${epA.id} 일정 키 미설정 — 건너뜀`);
  }

  // B. 15003029 — 기술사 등급 시험정보
  const epB = endpoints.engineerExamInfo;
  if (epB.apiKey) {
    try {
      const items = await client.fetchAllPages({ url: epB.url, apiKey: epB.apiKey, maxPages: 30 });
      for (const raw of items) {
        const s = normalizeEngineerExamItem(raw);
        if (!s || !s.externalCode) continue;
        const certId = codeToId.get(s.externalCode);
        if (!certId) continue;
        await upsertSchedule(certId, s);
        synced++;
      }
      log(`${epB.id}: ${items.length}건 수신`);
    } catch (err) {
      warn(`${epB.id} 실패: ${err.message}`);
    }
  } else {
    warn(`${epB.id} 일정 키 미설정 — 건너뜀`);
  }

  // C. 15003027 — 국가전문자격 시험 시행일정 (externalCode 없이 종목명 매칭)
  const epC = endpoints.professionalExamSchedule;
  if (epC.apiKey) {
    try {
      const items = await client.fetchAllPages({ url: epC.url, apiKey: epC.apiKey, maxPages: 30 });
      const titleToId = new Map();
      const titleCerts = await Certification.findAll({ attributes: ['id', 'title'] });
      for (const c of titleCerts) titleToId.set(c.title, c.id);

      for (const raw of items) {
        const s = normalizeProfessionalExamItem(raw);
        if (!s) continue;
        const certId = s.qualName && titleToId.get(s.qualName);
        if (!certId) continue;
        await upsertSchedule(certId, s);
        synced++;
      }
      log(`${epC.id}: ${items.length}건 수신`);
    } catch (err) {
      warn(`${epC.id} 실패: ${err.message}`);
    }
  } else {
    warn(`${epC.id} 일정 키 미설정 — 건너뜀`);
  }

  log(`시험일정 동기화 완료: ${synced}건`);
  return { synced };
};

const upsertSchedule = async (certId, s) => {
  try {
    const [row, created] = await ExamSchedule.findOrCreate({
      where: { certification_id: certId, exam_date: s.exam_date },
      defaults: {
        certification_id: certId,
        exam_date: s.exam_date,
        registration_start: s.registration_start,
        registration_end: s.registration_end,
      },
    });
    if (!created) {
      await row.update({
        registration_start: s.registration_start,
        registration_end: s.registration_end,
      });
    }
  } catch (err) {
    warn(`일정 upsert 실패: ${err.message}`);
  }
};

/**
 * 15075141 공개문제 메타 동기화
 * 실제 문제/보기 본문은 해당 API 가 아티클 ID 만 반환하는 경우가 있어
 * 우선은 externalCode + 아티클 메타를 수집해 QuestionBank 가 참조하도록 합니다.
 */
const syncOpenQuestions = async () => {
  const ep = endpoints.openQuestions;
  if (!ep.apiKey) {
    warn(`${ep.id} (${ep.description}): 서비스 키 미설정 — 생략`);
    return { synced: 0, skipped: true };
  }

  try {
    const items = await client.fetchAllPages({
      url: ep.url,
      apiKey: ep.apiKey,
      maxPages: 50,
    });

    const metas = items.map(normalizeOpenQuestionItem).filter(Boolean);

    // externalCode 별로 Certification 에 공개문제 존재 여부 표시
    const codeToId = new Map();
    const certs = await Certification.findAll({
      where: { external_code: { [Op.not]: null } },
      attributes: ['id', 'external_code', 'extra'],
    });
    for (const c of certs) codeToId.set(c.external_code, c);

    let linked = 0;
    for (const meta of metas) {
      const cert = codeToId.get(meta.externalCode);
      if (!cert) continue;
      // extra 필드에 공개문제 보유 플래그 + 최신 artlSeq 저장
      const extraObj = {
        hasOpenQuestions: true,
        latestArtlSeq: meta.artlSeq,
        latestTitle: meta.title,
      };
      await cert.update({ extra: JSON.stringify(extraObj) });
      linked++;
    }

    log(`${ep.id} 공개문제: ${items.length}건 → 자격증 ${linked}개와 연결`);
    return { synced: linked, total: items.length };
  } catch (err) {
    warn(`${ep.id} 실패: ${err.message}`);
    return { synced: 0, error: err.message };
  }
};

module.exports = {
  syncCertifications,
  syncExamSchedules,
  syncOpenQuestions,
};
