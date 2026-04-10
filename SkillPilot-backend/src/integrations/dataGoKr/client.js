/**
 * data.go.kr (공공데이터포털) 공통 HTTP 클라이언트
 *
 * 대부분의 산업인력공단 API 는 XML 응답을 기본으로 반환합니다.
 * - XML → JSON 변환에 fast-xml-parser 사용
 * - 서비스 키는 이미 URL 인코딩된 값을 그대로 붙이도록 처리
 * - 타임아웃과 재시도 포함
 *
 * 호출 시 반드시 `apiKey` 를 전달하세요. 공공데이터포털 API 마다 다른 키를
 * 사용할 수 있으므로 client 가 전역 설정을 직접 읽지 않습니다.
 */

const { XMLParser } = require('fast-xml-parser');
const config = require('../../config');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: true,
  trimValues: true,
});

const buildQuery = (params) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
};

/**
 * data.go.kr API 호출
 * @param {object} opts
 * @param {string} opts.url - 전체 엔드포인트 URL
 * @param {string} opts.apiKey - 이 엔드포인트에 해당하는 인코딩된 서비스 키
 * @param {object} [opts.params={}] - 쿼리 파라미터
 * @param {'xml'|'json'} [opts.format='xml']
 * @param {number} [opts.retries=2]
 */
const call = async ({ url, apiKey, params = {}, format = 'xml', retries = 2 }) => {
  if (!apiKey) {
    throw new Error('data.go.kr API key is not provided for this endpoint');
  }

  // serviceKey 는 이미 인코딩된 상태로 주어지는 경우가 많으므로 직접 문자열 조립
  const serviceKeyPart = `serviceKey=${apiKey}`;
  const otherParams = buildQuery({
    ...params,
    _type: format === 'json' ? 'json' : undefined,
  });
  const fullUrl = `${url}?${serviceKeyPart}${otherParams ? `&${otherParams}` : ''}`;

  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.dataGoKr.timeoutMs);

      const res = await fetch(fullUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: { Accept: format === 'json' ? 'application/json' : 'application/xml' },
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const text = await res.text();

      // 에러 응답 감지 (공공데이터포털 공통 에러 패턴)
      if (text.includes('SERVICE ERROR') || text.includes('INVALID_REQUEST_PARAMETER_ERROR')) {
        throw new Error(`data.go.kr API error: ${text.slice(0, 300)}`);
      }

      if (format === 'json') {
        try {
          return JSON.parse(text);
        } catch {
          // JSON 요청이었지만 XML 응답이 온 경우 fallback
          return parser.parse(text);
        }
      }
      return parser.parse(text);
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
    }
  }
  throw lastErr;
};

/**
 * 응답에서 item 배열 추출 (공공데이터포털 표준 응답 구조)
 * response > body > items > item (단일 또는 배열)
 */
const extractItems = (data) => {
  if (!data) return [];
  const body =
    data?.response?.body ||
    data?.Response?.body ||
    data?.body ||
    data;

  const items = body?.items?.item ?? body?.items ?? body?.item ?? [];
  if (Array.isArray(items)) return items;
  if (items && typeof items === 'object') return [items];
  return [];
};

/**
 * 페이징 응답의 전체 데이터를 모두 수집
 */
const fetchAllPages = async ({ url, apiKey, params = {}, format = 'xml', pageSize = 100, maxPages = 50 }) => {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const data = await call({
      url,
      apiKey,
      params: { ...params, pageNo: page, numOfRows: pageSize },
      format,
    });
    const items = extractItems(data);
    all.push(...items);
    if (items.length < pageSize) break;
  }
  return all;
};

module.exports = { call, extractItems, fetchAllPages };
