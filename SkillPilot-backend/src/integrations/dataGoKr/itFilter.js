/**
 * IT 관련 자격증만 필터링하는 규칙 엔진
 *
 * 국가기술자격은 '정보기술' 계열 또는 특정 직무분야 코드를 갖고 있고,
 * 종목명에 IT 키워드가 포함되는 경우가 대부분입니다.
 */

// IT 계열 키워드 (종목명/분야명 부분일치)
const IT_KEYWORDS = [
  // 소프트웨어 / 개발
  '정보처리', '정보기술', '소프트웨어', '프로그래', '웹디자인', '웹개발', '게임',
  'SW', '컴퓨터운용', '컴퓨터활용', '컴퓨터시스템', '멀티미디어',
  // 데이터
  '데이터', 'SQL', 'ADsP', 'ADP', '빅데이터', 'SQLD', 'SQLP',
  // 네트워크 / 보안
  '정보보안', '정보보호', '네트워크', '전자계산', '정보통신', '무선설비',
  '통신설비', '통신기기', '전자기기', '정보시스템', '산업보안',
  // 인공지능
  '인공지능', 'AI', '머신러닝', '딥러닝', '로봇',
  // 클라우드
  '클라우드', '리눅스', 'Linux',
  // 전기/전자 중 IT 관련
  '전자', '반도체', '임베디드',
];

// IT 와 무관하지만 위 키워드 부분일치에 잡힐 수 있는 종목 배제
const EXCLUDE_KEYWORDS = [
  '용접', '제과', '제빵', '미용', '이용', '조리', '세탁', '한복',
  '보일러', '건축', '토목', '도배', '도장', '배관', '철도', '철근',
  '자동차', '항공', '농업', '축산', '원예', '임업', '잠업',
  '화훼', '광산', '지적', '측량', '경영', '유통관리', '회계',
  '관광', '소비자', '세무', '물류',
];

const normalize = (s) => String(s || '').toLowerCase().replace(/\s+/g, '');

const matchesAny = (text, keywords) => {
  const t = normalize(text);
  return keywords.some((k) => t.includes(normalize(k)));
};

/**
 * 주어진 자격증 종목명/분야가 IT 관련인지 판단
 * @param {object} item - { title, field?, category? } 형태
 */
const isITCertification = (item) => {
  const haystack = [item.title, item.field, item.category, item.description]
    .filter(Boolean)
    .join(' ');

  if (!haystack) return false;
  if (matchesAny(haystack, EXCLUDE_KEYWORDS)) return false;
  return matchesAny(haystack, IT_KEYWORDS);
};

/**
 * 배열 필터 헬퍼
 */
const filterIT = (items) => items.filter(isITCertification);

module.exports = { isITCertification, filterIT, IT_KEYWORDS, EXCLUDE_KEYWORDS };
