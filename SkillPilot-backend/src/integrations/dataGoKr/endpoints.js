/**
 * data.go.kr 엔드포인트 레지스트리
 *
 * 각 엔드포인트는 `id`, `kind`, `url`, `description`, `apiKey` 를 포함합니다.
 * `apiKey` 는 환경변수에서 다음 우선순위로 선택됩니다:
 *   1. DATA_GO_KR_KEY_<id>  (개별 키)
 *   2. DATA_GO_KR_API_KEY   (기본 폴백 키)
 *
 * 사용자가 제공한 7개 공공데이터포털 API (한국산업인력공단 / Q-Net)
 * 2개는 apis.data.go.kr 신규 베이스, 5개는 openapi.q-net.or.kr 레거시 베이스를 사용합니다.
 *
 * 1. 15003024 - 한국산업인력공단_국가자격 종목 목록 정보
 *    https://www.data.go.kr/data/15003024/openapi.do
 * 2. 15041600 - 한국산업인력공단_국가기술자격 종목 정보 (개요/수행직무/진로)
 *    https://www.data.go.kr/data/15041600/openapi.do
 * 3. 15074408 - 한국산업인력공단_국가자격 시험일정 조회 서비스
 *    https://www.data.go.kr/data/15074408/openapi.do
 * 4. 15003029 - 한국산업인력공단_국가기술자격 종목별 시험정보 (기술사 등급)
 *    https://www.data.go.kr/data/15003029/openapi.do
 * 5. 15003027 - 한국산업인력공단_국가전문자격 시험 시행일정 정보
 *    https://www.data.go.kr/data/15003027/openapi.do
 * 6. 15039800 - 한국산업인력공단_국가기술자격 취득 관련 현황 (통계)
 *    https://www.data.go.kr/data/15039800/openapi.do
 * 7. 15075141 - 한국산업인력공단_국가자격 공개문제 조회 서비스 (기출)
 *    https://www.data.go.kr/data/15075141/openapi.do
 */

const config = require('../../config');

// 2종의 베이스 URL (공공데이터포털이 제공하는 실제 엔드포인트 루트)
const QNET_BASE = 'http://openapi.q-net.or.kr/api/service/rest';
const DATA_BASE = 'http://apis.data.go.kr/B490007';

const resolveKey = (id) => config.dataGoKr.keys[id] || config.dataGoKr.apiKey || '';

const endpoints = {
  // 1. 국가자격 종목 목록 정보 (15003024)
  //    전체 자격 종목 목록 스캔 → IT 필터 진입점
  qualificationList: {
    id: '15003024',
    kind: '목록',
    url: `${QNET_BASE}/InquiryListNationalQualifcationSVC/getList`,
    description: '국가자격 종목 목록 정보',
    get apiKey() { return resolveKey('15003024'); },
  },

  // 2. 국가기술자격 종목 정보 (15041600)
  //    종목별 상세(개요·수행직무·진로·출제경향)
  qualificationDetail: {
    id: '15041600',
    kind: '상세',
    url: `${QNET_BASE}/InquiryQualInfo/getList`,
    description: '국가기술자격 종목 상세 정보',
    get apiKey() { return resolveKey('15041600'); },
  },

  // 3. 국가자격 시험일정 조회 서비스 (15074408)
  //    필기/실기 회차별 일정 (ExamSchedule 동기화 주 소스)
  qualExamSchedule: {
    id: '15074408',
    kind: '일정',
    url: `${DATA_BASE}/qualExamSchd/getQualExamSchdList`,
    description: '국가자격 시험일정 조회 서비스',
    get apiKey() { return resolveKey('15074408'); },
  },

  // 4. 국가기술자격 종목별 시험정보 (15003029)
  //    기술사 등급 시험 시행일정
  engineerExamInfo: {
    id: '15003029',
    kind: '일정',
    url: `${QNET_BASE}/InquiryTestInformationNTQSVC/getPEList`,
    description: '국가기술자격 종목별 시험정보 (기술사)',
    get apiKey() { return resolveKey('15003029'); },
  },

  // 5. 국가전문자격 시험 시행일정 정보 (15003027)
  professionalExamSchedule: {
    id: '15003027',
    kind: '일정',
    url: `${QNET_BASE}/InquiryTestDatesNationalProfessionalQualificationSVC/getList`,
    description: '국가전문자격 시험 시행일정 정보',
    get apiKey() { return resolveKey('15003027'); },
  },

  // 6. 국가기술자격 취득 관련 현황 (15039800)
  //    취득자 수·교부/미교부 통계 → 인기도 계산
  qualificationStats: {
    id: '15039800',
    kind: '통계',
    url: `${QNET_BASE}/InquiryQualRelaPtcondSVC/getArtlList`,
    description: '국가기술자격 취득 관련 현황',
    get apiKey() { return resolveKey('15039800'); },
  },

  // 7. 국가자격 공개문제 조회 서비스 (15075141)
  //    공개(기출) 문제 메타데이터 → 문제은행 실데이터 소스
  openQuestions: {
    id: '15075141',
    kind: '문제',
    url: `${DATA_BASE}/openQst/getOpenQstList`,
    description: '국가자격 공개문제 조회 서비스',
    get apiKey() { return resolveKey('15075141'); },
  },
};

/**
 * 키가 하나라도 설정되어 있는지 확인 (스케줄러 등록 여부 결정용)
 */
const hasAnyKey = () => {
  if (config.dataGoKr.apiKey) return true;
  return Object.values(config.dataGoKr.keys).some((k) => !!k);
};

module.exports = endpoints;
module.exports.hasAnyKey = hasAnyKey;
module.exports.resolveKey = resolveKey;
