/**
 * data.go.kr 원본 응답을 내부 도메인 모델로 정규화
 *
 * 공공데이터 응답 필드는 API 마다 key 가 약간씩 다릅니다 (camelCase / lowercase / UPPER_SNAKE).
 * 존재 가능한 여러 key 후보를 모두 확인해서 정규화합니다.
 */

const pick = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
};

const toNumber = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(String(v).replace(/[^\d.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const parseDate = (v) => {
  if (!v) return null;
  const s = String(v).replace(/[^\d]/g, '');
  if (s.length !== 8) return null;
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
};

/**
 * 15003024 (종목 목록) 응답 → 정규화
 * 필드: jmcd, jmfldnm, seriescd, seriesnm, obligfldcd, obligfldnm, mdobligfldcd, mdobligfldnm, qualgbcd, qualgbnm
 */
const normalizeListItem = (item) => {
  const title = pick(item, ['jmfldnm', 'jmNm', 'jmnm', 'name']);
  if (!title) return null;

  const externalCode = pick(item, ['jmcd', 'jmCd', 'code']) || null;
  const field = pick(item, ['mdobligfldnm', 'mdobligFldNm', 'obligfldnm', 'seriesnm', 'seriesNm']);
  const qualKind = pick(item, ['qualgbnm', 'qualgbNm']);

  return {
    externalCode: externalCode ? String(externalCode) : null,
    title: String(title).trim(),
    field: field ? String(field).trim() : null,
    qualKind: qualKind ? String(qualKind).trim() : null,
  };
};

/**
 * 15041600 (종목 상세 정보) 응답 → Certification 페이로드
 * 필드: jmNm, engJmNm, seriesNm, mdobligFldNm, summary, job, Career, hist, implNm, instiNm, trend
 */
const normalizeDetailItem = (item, { sourceId, levelGuess } = {}) => {
  const title = pick(item, ['jmNm', 'jmnm', 'jmfldnm']);
  if (!title) return null;

  const externalCode = pick(item, ['jmCd', 'jmcd', 'code']) || null;
  const field = pick(item, ['mdobligFldNm', 'mdobligfldnm', 'seriesNm', 'seriesnm']);
  const seriesLevel = pick(item, ['seriesNm', 'seriesnm']); // 기사/산업기사/기능사 등
  const description = pick(item, ['summary', 'description']);
  const jobs = pick(item, ['job', 'career', 'Career']);
  const tips = pick(item, ['trend', 'hist']);
  const issuer = pick(item, ['implNm', 'instiNm', 'issuer']) || '한국산업인력공단';

  return {
    source: 'data.go.kr',
    external_source_id: sourceId || '15041600',
    external_code: externalCode ? String(externalCode) : null,
    title: String(title).trim(),
    level: levelGuess || '국가기술',
    field: field ? String(field).trim() : null,
    description: description ? String(description).trim() : null,
    jobs: jobs ? String(jobs).trim().slice(0, 500) : null,
    tips: tips ? String(tips).trim() : null,
    issuer: issuer ? String(issuer).trim() : null,
    extra: seriesLevel ? `등급: ${seriesLevel}` : null,
    synced_at: new Date(),
  };
};

/**
 * 15039800 (취득 관련 현황 통계) → { externalCode, givecnt, giveNotcnt, implYy }
 */
const normalizeStatItem = (item) => {
  const externalCode = pick(item, ['jmCd', 'jmcd', 'code']);
  const givecnt = toNumber(pick(item, ['givecnt', 'giveCnt', '교부자수']));
  const giveNotcnt = toNumber(pick(item, ['giveNotcnt', 'givenotcnt', '미교부자수']));
  const implYy = pick(item, ['implYy', 'implyy', '시행년도']);

  if (!externalCode && givecnt === null) return null;

  return {
    externalCode: externalCode ? String(externalCode) : null,
    givecnt,
    giveNotcnt,
    implYy: implYy ? String(implYy) : null,
  };
};

/**
 * 15074408 (국가자격 시험일정) → 일정 레코드
 * 필드: implYy, implSeq, qualgbCd, qualgbNm, docRegStartDt, docExamStartDt, docPassDt, pracRegStartDt, pracExamStartDt, pracPassDt
 */
const normalizeQualExamScheduleItem = (item) => {
  const externalCode = pick(item, ['jmCd', 'jmcd']);
  const examDate = parseDate(pick(item, ['docExamStartDt', 'docExamDt', 'examDate']));
  const regStart = parseDate(pick(item, ['docRegStartDt', 'regStartDt', 'applStdt']));
  const regEnd = parseDate(pick(item, ['docRegEndDt', 'regEndDt', 'applEddt']));

  if (!examDate) return null;

  return {
    externalCode: externalCode ? String(externalCode) : null,
    exam_date: examDate,
    registration_start: regStart,
    registration_end: regEnd,
    qualKind: pick(item, ['qualgbNm', 'qualgbnm']),
  };
};

/**
 * 15003029 (기술사 시험정보) → 일정 레코드
 * 필드: description(회차), docRegStartDt, docRegEndDt, docExamDt, docPassDt, pracRegStartDt, pracExamStartDt, pracPassDt
 */
const normalizeEngineerExamItem = (item) => {
  const externalCode = pick(item, ['jmCd', 'jmcd']);
  const examDate = parseDate(pick(item, ['docExamDt', 'docExamStartDt']));
  const regStart = parseDate(pick(item, ['docRegStartDt']));
  const regEnd = parseDate(pick(item, ['docRegEndDt']));

  if (!examDate) return null;

  return {
    externalCode: externalCode ? String(externalCode) : null,
    exam_date: examDate,
    registration_start: regStart,
    registration_end: regEnd,
  };
};

/**
 * 15003027 (국가전문자격 시험 시행일정) → 일정 레코드
 * 필드: description, EXAM_REG_START_DT, EXAM_REG_END_DT, EXAM_START_DT, EXAM_END_DT, PASS_START_DT, PASS_END_DT
 */
const normalizeProfessionalExamItem = (item) => {
  const examDate = parseDate(pick(item, [
    'EXAM_START_DT', 'exam_start_dt', 'examStartDt',
    'docExamStartDt', 'docExamDt',
  ]));
  const regStart = parseDate(pick(item, [
    'EXAM_REG_START_DT', 'exam_reg_start_dt', 'regStartDt',
    'docRegStartDt',
  ]));
  const regEnd = parseDate(pick(item, [
    'EXAM_REG_END_DT', 'exam_reg_end_dt', 'regEndDt',
    'docRegEndDt',
  ]));

  if (!examDate) return null;

  return {
    externalCode: null, // 전문자격은 jmCd 가 없는 경우가 많음
    qualName: pick(item, ['qualgbNm', 'qualgbnm', 'QUAL_GB_NM']),
    exam_date: examDate,
    registration_start: regStart,
    registration_end: regEnd,
  };
};

/**
 * 15075141 (국가자격 공개문제 조회) → 문제 메타 레코드
 * 필드: artlSeq(게시물ID), title, qualgbCd, qualgbNm, seriesCd, seriesNm, jmCd, jmNm, regDttm, modDttm
 */
const normalizeOpenQuestionItem = (item) => {
  const externalCode = pick(item, ['jmCd', 'jmcd']);
  const artlSeq = pick(item, ['artlSeq', 'artlseq']);
  const title = pick(item, ['title']);

  if (!externalCode || !title) return null;

  return {
    externalCode: String(externalCode),
    artlSeq: artlSeq ? String(artlSeq) : null,
    title: String(title).trim(),
    seriesName: pick(item, ['seriesNm', 'seriesnm']),
    jmName: pick(item, ['jmNm', 'jmnm']),
    qualKind: pick(item, ['qualgbNm', 'qualgbnm']),
  };
};

module.exports = {
  normalizeListItem,
  normalizeDetailItem,
  normalizeStatItem,
  normalizeQualExamScheduleItem,
  normalizeEngineerExamItem,
  normalizeProfessionalExamItem,
  normalizeOpenQuestionItem,
};
