# SkillPilot UI 리팩토링 변경 정리

> 작업 세션에서 진행된 디자인 시스템 도입 + 13개 페이지 마이그레이션 + AI 학습 메이트(챗봇 실 AI 연결 + 자동 응원 mock) + 대시보드 가시화 위젯 4종 + 모의면접 setup 리디자인.

- **빌드 상태**: ✅ `npx vite build` 통과
- **작업 범위**: `Client/` 디렉터리 + 백엔드 일부 (assistant chat 엔드포인트, learningRecord summary 확장)
- **DB 스키마 변경**: 없음 (기존 모델 그대로 활용)

---

## 📌 한 줄 요약

기존 글로벌 CSS와 navy 디자인 톤은 유지한 채, **CSS 변수 기반 디자인 토큰**을 도입하고 **공통 UI 컴포넌트 6종**을 추출해 13개 페이지를 통일했다. 모든 페이지에 따라다니는 **🦉 학습 메이트**를 추가했고(챗 패널은 실제 OpenAI 연결, 자동 응원·채찍은 mock), 대시보드는 **통계 카드 + 진행률 도넛 + 학습 잔디밭 + 추이 차트**로 한눈에 보이게 가시화했다.

---

## 1. 새로 추가된 파일

### Foundation
| 경로 | 역할 |
|---|---|
| `src/styles/tokens.css` | 디자인 토큰 (색상, radius, spacing, typography, shadow, motion, z-index) |

### 공통 UI 컴포넌트 (`src/components/ui/`)
| 컴포넌트 | 파일 | 주요 기능 |
|---|---|---|
| `Button` | `Button.jsx` + `.css` | variant 4종(primary/secondary/ghost/danger) × size 3종, loading 스피너, leftIcon/rightIcon |
| `Card` + `CardHeader` | `Card.jsx` + `.css` | padding 4단계, interactive hover 옵션 |
| `Input` | `Input.jsx` + `.css` | label/hint/error + `aria-invalid`/`aria-describedby` + leftIcon/rightIcon |
| `Modal` | `Modal.jsx` + `.css` | Portal, ESC 닫기, body 스크롤 잠금, `role="dialog"` + `aria-modal` + `aria-labelledby` |
| `Loading` | `Loading.jsx` + `.css` | inline / block / overlay × sm/md/lg, `role="status"` + `aria-live` |
| `EmptyState` | `EmptyState.jsx` + `.css` | icon + title + description + action 슬롯 |
| **index** | `index.js` | 위 6종 일괄 export |

### AI 학습 메이트 (`src/components/assistant/`)
| 파일 | 역할 |
|---|---|
| `Assistant.jsx` + `.css` | 플로팅 알약 도크(캐릭터+라벨 항상 표시) + 말풍선 + 챗봇 패널 + typing indicator |
| `CheerBanner.jsx` + `.css` | 대시보드용 7초마다 회전하는 응원/팁 배너 (mood별 톤 차이) |
| `AssistantContext.jsx` | 다른 페이지에서 cheer/scold/tip 트리거할 수 있는 React Context |
| `messages.js` | 컨텍스트별 멘트 풀 + 키워드 매칭 mock 챗봇 응답 (API 실패 시 fallback) |
| `index.js` | 일괄 export |

### 대시보드 위젯 (`src/components/dashboard/`)
| 파일 | 역할 |
|---|---|
| `StatRow.jsx` + `.css` | 헤로 통계 카드 4종 (모두 동일한 navy 그라디언트 액센트, 아이콘 없는 미니멀) |
| `ProgressDonut.jsx` + `.css` | SVG 단일 도넛 차트 (gradient stroke, 가운데 큰 % 숫자) |
| `StudyHeatmap.jsx` + `.css` | GitHub-style 12주 학습 잔디밭 (5단계 navy 농도) |
| `StudyTrendChart.jsx` + `.css` | Recharts 14일 학습 시간 AreaChart |
| `index.js` | 일괄 export |

---

## 2. 디자인 토큰 (`src/styles/tokens.css`)

기존 페이지마다 흩어져 있던 색상/spacing/radius를 `:root`의 CSS 변수로 모았다. 글로벌 CSS 구조는 유지했기 때문에 클래스명을 바꿀 필요는 없다 — 색상값만 변수로 치환.

### 정의된 토큰 그룹
- **Brand**: `--color-primary` (#2d3e5d) 외 5종
- **Accent blue**: `--color-accent`, `--color-accent-strong`, `--color-accent-soft` 등
- **Surface**: app/page/subtle/muted/hover/surface
- **Border**: 일반/약한/강한
- **Text**: strong/text/muted/subtle/faint
- **Status**: danger/warning/success (+ soft 버전)
- **Radius**: xs(4) → xl(20), pill(999)
- **Spacing**: 4 → 40 (8 단계)
- **Typography**: font-size xs(11) → 5xl(28), weight regular/medium/semibold/bold/extrabold
- **Shadow**: card/card-hover/pop/focus
- **Motion**: transition-fast/base
- **Layout & z-index**

### 글로벌 효과
- `*:focus-visible` → 키보드 포커스에만 포커스 링 표시
- `prefers-reduced-motion: reduce` 사용자 자동 대응 (`index.css`)
- `.sr-only` 스크린 리더 전용 클래스 추가

---

## 3. AI 학습 메이트 🦉 (챗 = 실 AI / 자동 멘트 = mock)

**위치**: 우하단 **알약 도크** — 캐릭터 + "학습 메이트 / 클릭해서 대화하기" 라벨이 항상 보임. 로그인/회원가입 페이지에서는 자동 숨김.

### 외형
- 무지개 그라디언트(인디고→블루→시안) + shimmer 애니메이션 + 부유 모션
- 캐릭터 주변 **펄스 ring** 2개 (호흡하듯 동심원으로 퍼짐)
- 캐릭터 **wiggle** 모션 (4초마다 한 번 갸우뚱)
- 첫 진입 시 환영 말풍선 6.5초 자동 노출
- 챗 패널 열리면 알약은 작은 동그라미로 collapse

### 자동 트리거
| 시점 | 동작 |
|---|---|
| 라우트 진입 | 페이지에 어울리는 멘트 (`ROUTE_GREETING` 매핑) |
| 90초 무활동 | 채찍 (`scold.inactive`) |
| CBT 5문제마다 | 응원 (`cheer.streak`) |
| CBT 시간 30초 남음 | 채찍 (`scold.timeout`) |
| CBT 제출 완료 | 응원 (`cheer.completed`) |
| AnswerAnalyze 결과 | 정답률 80% 이상 → 칭찬 / 60% 이상 → 팁 / 그 외 → 채찍 |
| MockInterview 시작 | 팁 (`tip.interview`) |
| MockInterview 답변 | 점수 80↑ 칭찬, 60↓ 채찍, 종료 시 `cheer.completed` |

### 4가지 mood
말풍선 색상이 mood에 따라 다름.
- `cheer` (응원/칭찬) — 파란 톤
- `scold` (채찍) — 빨간 톤
- `tip` (팁) — 노란 톤
- `idle` (잡담) — 기본

### 챗봇 (실제 AI 연결 ⚡)
- 우하단 🦉 클릭 → 챗 패널 오픈 → 입력 시 백엔드 `POST /api/assistant/chat` 호출
- **백엔드** `ai.service.chatTurn()` — 학습 코치 system prompt + 최근 10턴 컨텍스트 + `temperature 0.7` + `max_completion_tokens 220`
- 신모델(o1/o3/gpt-4.1 등)이 `max_tokens` 거부 시 → `max_completion_tokens` → 다시 `max_tokens` 순으로 자동 재시도
- **typing indicator** (•••점 바운스) — 응답 대기 동안 사용자 답답함 해소
- **API 실패 시 mock 응답으로 자동 fallback** + `OFFLINE` 배지 표시 → 시연 안전망
- 키워드 매칭 mock 응답 10가지 (안녕, 시험, 틀렸, 자신없, 졸려, 추천, 감사, 로드맵, 면접, 채용 등)
- 안 읽은 메시지 뱃지 + ESC 닫기 + 모바일 반응형

### 자동 응원 배너 (대시보드 한정)
- `<CheerBanner intervalMs={7000} />` — 7초마다 페이드 전환
- `messages.js`의 cheer/tip/idle 풀에서 셔플
- mood별로 좌측 그라디언트 바 색이 달라짐 (모두 navy 톤 안에서)

### 다른 페이지에서 사용하는 법
```jsx
import { useAssistant } from '../components/assistant';
const assistant = useAssistant();
assistant.cheer('cheer.correct');   // 응원
assistant.scold('scold.wrong');     // 채찍
assistant.tip('tip.cbt');            // 팁
assistant.greet();                   // 인사
```

---

## 4. 페이지별 변경 내역

### 4.1 Dashboard (`Dashboard.jsx` + `dashboard.css`)
- 모달 3개(자격증 상세, 학습 기록 추가, 일정 편집) → 새 `<Modal>` 컴포넌트로 교체
- 빈 상태 4곳(일정/공지/팁/검색결과) → `<EmptyState>`로 통일
- 사이드바: `aria-label`, `aria-expanded`, `aria-controls`, `aria-current="page"` 추가
- 헤더 menu-btn / brand에 aria-label
- `dashboard.css` 색상 12종 토큰 치환:
  - `#2d3e5d` → `var(--color-primary)`
  - `#dbeafe` → `var(--color-accent-soft)`
  - `#ef4444` → `var(--color-danger)` 등
- **반응형 통합 추가**: 768px/480px 미디어 쿼리 (헤더, 카드, 캘린더, 마이페이지, 일정 카드 모두 모바일 대응)
- **가시화 위젯 4종 추가** (자세한 내용은 §6 참조):
  - welcome 카드 아래 `<StatRow>` (4개 통계 카드, 모두 동일한 navy 톤)
  - `<CheerBanner>` (7초 회전 응원 배너)
  - 로드맵 카드의 progress-bar → `<ProgressDonut>` (140px SVG 도넛)
  - 학습 기록 카드 안 `<StudyTrendChart>` + `<StudyHeatmap>` 통합

### 4.2 Login (`Login.jsx` + `login.css`)
- 로그인 버튼 → `<Button loading={loading}>`
- `<form noValidate>` + `htmlFor` + `autoComplete="email"/current-password"`
- `alt="logo"` → `alt="SkillPilot 로고"`, 기능적 이미지/장식 이미지 구분
- 에러 메시지 인라인 스타일 → `.error-message` + `role="alert"`
- 소셜 버튼 aria-label
- `login.css` 전체 토큰화 + **900px 이하에서 칼럼 → 세로 스택** 반응형

### 4.3 Signup (`Signup.jsx` + `signup.css`)
- 가입 버튼 → `<Button loading={loading}>`
- `InputGroup`: `useId` 기반 자동 id, label-input htmlFor 연결
- alert() 제거 → 화면에 `role="alert"` 메시지로 표시
- autoComplete: name/email/new-password
- 뒤로가기 버튼 aria-label + hover/focus 스타일
- `signup.css` 색상 5종 토큰 치환

### 4.4 ProfileSetup (`ProfileSetup.jsx`)
- 완료 버튼 → `<Button>`
- 모든 select/input에 htmlFor + autoComplete
- 아이콘 `aria-hidden="true"`
- (signup.css 공유, 토큰화는 위에서 같이 됨)

### 4.5 GoalSetting (`GoalSetting.jsx`)
- 완료 버튼 → `<Button>`
- 직무 선택 카드: `<div onClick>` → `<button type="button" aria-pressed>` (키보드/스크린리더 지원)
- 슬라이더 `aria-valuetext`, period 표시 `aria-live="polite"`
- 직무 선택 그룹에 `role="group"` + `aria-labelledby`

### 4.6 CertificationRecommendation (`CertificationRecommendation.jsx`)
- 로딩 → `<Loading variant="block">`
- 에러 → `<EmptyState>` + 다시 시도 액션
- 추천 카드: `role="radio"` + `aria-checked` + `tabIndex={0}` + Enter/Space 키보드 지원
- `<div role="radiogroup">`로 그룹화
- 선택 완료 버튼 → `<Button>`

### 4.7 WeeklyRoadmap (`WeeklyRoadmap.jsx` + `roadmap.css`)
- 로딩 → `<Loading>`
- 에러 → `<EmptyState>` + “다시 생성” 액션
- **빈 주차 상태** 추가 (기존엔 없었음) → `<EmptyState>`
- 우선순위 버튼: `aria-pressed` + `role="group"`
- 완성 버튼 → `<Button>`
- `roadmap.css` 토큰 치환

### 4.8 CBT (`CBT.jsx` + `CBT.css`)
- **🐛 React Rules of Hooks 위반 수정**: `if (!certId) return ...`이 hook 호출보다 위에 있어 conditional hook 에러. 모든 hooks 호출 후로 이동
- 로딩/에러/메뉴 → `<Loading>`, `<EmptyState>`, `<Button>`로 교체
- 이전 응시 기록 카드: `role="button"` + `tabIndex` + Enter/Space 지원, hover 효과 토큰화
- **어시스턴트 트리거 6곳**:
  - 메뉴 진입 → `tip.cbt`
  - 시험 시작 → `cheer.streak`
  - 5문제마다 → `cheer.streak`
  - 시간 30초 남음 → `scold.timeout`
  - 제출 완료 → `cheer.completed`
- `CBT.css` 색상 토큰 치환 + 새 클래스(`.cbt-menu-main`, `.cbt-history-*`) 추가

### 4.9 AnswerAnalyze (`AnswerAnalyze.jsx`)
- 로딩 → `<Loading>`, 에러 → `<EmptyState>` + 돌아가기 버튼
- **결과별 어시스턴트 멘트**:
  - 정답률 80% 이상 → `cheer.completed` (칭찬)
  - 60% 이상 → `tip.cbt` (팁)
  - 그 외 → `scold.wrong` (채찍)
- 하단 “로드맵 조정하기” → `<Button>`

### 4.10 MockInterview (`MockInterview.jsx` + `mockInterview.css`)
- 면접 시작/전송 버튼 → `<Button>`
- 답변 textarea에 `<label className="sr-only">` 연결
- 대화 영역 `aria-live="polite"`
- AI 응답 로딩 → `<Loading size="sm">`
- **어시스턴트 트리거 3곳**:
  - 시작 → `tip.interview`
  - 답변 점수 80↑ → `cheer.interview`, 60↓ → `scold.wrong`
  - 면접 종료 → `cheer.completed`
- 뒤로가기 버튼 aria-label
- `mockInterview.css` 색상 토큰화
- **🎤 setup 화면 완전 리디자인** (Before: 작은 input + 버튼만 있는 휑한 카드):
  - Hero: 큰 🎤 이모지(호흡 모션) + "실전처럼, 부담 없이" 타이틀 + 부제
  - 3단계 진행 표시 (1 직무 선택 → 2 질문 답변 → 3 피드백 + 점수)
  - 큰 입력 필드 (18px 폰트, 4px 포커스 ring, autoFocus)
  - **빠른 선택 chips 8종** — 백엔드/프론트엔드/데이터분석/데이터엔지니어/AI/iOS/DevOps/보안 (이모지 + active 그라디언트)
  - 큰 fullWidth 시작 버튼 + "면접관을 불러오는 중..." 로딩 텍스트
  - 하단 안내: "💡 모르면 모른다고 말해도 점수가 깎이지 않아요"
  - 상단 6px 그라디언트 액센트 + 페이지 배경에 부드러운 radial 그라디언트

### 4.11 JobMatching (`JobMatching.jsx` + `jobMatching.css`)
- 로딩 텍스트 → `<Loading variant="block">`
- 빈 상태 → `<EmptyState>` + “대시보드로” 액션
- 뒤로가기 버튼 aria-label
- 에러 메시지 `role="alert"`
- 색상 토큰화

### 4.12 Portfolio (`Portfolio.jsx` + `portfolio.css`)
- “포트폴리오 만들기” 버튼 → `<Button size="lg">`
- `portfolio.css` 색상 12회 토큰 치환

### 4.13 PortfolioPreview (`PortfolioPreview.jsx`)
- 로딩 텍스트 → `<Loading variant="block">`
- 돌아가기 버튼 → `<Button>`

---

## 5. 글로벌 변경

### `src/main.jsx`
```diff
+ import './styles/tokens.css';   // 가장 먼저 로드
  import './index.css';
```

### `src/index.css`
- 글로벌 박스 모델 (`*, *::before, *::after { box-sizing: border-box }`)
- 색상/폰트/배경을 토큰으로
- `.sr-only` 클래스
- `prefers-reduced-motion` 글로벌 감속

### `src/App.jsx`
- `<AssistantProvider>` + `<Assistant />` 마운트 (BrowserRouter 안쪽)
- `loading-screen` 텍스트 → `<Loading variant="overlay">`

---

## 6. 대시보드 가시화 위젯 4종 (상세)

### 6.1 `<StatRow>` — 헤로 통계 카드 4개
- **데이터**: 연속 학습일 / 이번 주 학습 / 로드맵 진행 / 도전 자격증
- **디자인**: 4개 모두 **동일한 navy 그라디언트 액센트** (사용자 피드백으로 다채로운 색상 → 통일)
- **아이콘 없음** (사용자 피드백 반영) — 큰 숫자 + 라벨 + 보조 설명만의 미니멀 구성
- 좌측 4px 그라디언트 바, hover 시 떠오르는 모션
- 모바일: 4열 → 2열(900px) → 그대로 2열(480px)

### 6.2 `<ProgressDonut>` — SVG 단일 도넛
- 직접 그린 SVG (라이브러리 없음)
- 그라디언트 stroke (#3b82f6 → #1e40af) + linecap round
- 가운데 큰 % 숫자 + "전체 진행률" 라벨
- 0.6초 stroke-dasharray transition

### 6.3 `<StudyHeatmap>` — GitHub-style 학습 잔디밭
- 12주(84일) × 7일 그리드
- 학습 시간 5단계 농도 (모두 navy 톤 안에서 농도만 변화 — 사용자 피드백 반영)
  - 0시간 / 0~1h / 1~2h / 2~4h / 4h+
- 각 셀 hover 시 확대 + tooltip
- 상단에 총 학습일 / 총 시간 헤드 라벨

### 6.4 `<StudyTrendChart>` — Recharts AreaChart
- 최근 14일 학습 시간 라인 + 그라디언트 fill
- hover 시 tooltip ("X시간")
- ResponsiveContainer (자동 너비)
- 의존성: `recharts ^3.8.1` 신규 추가

### 6.5 데이터 소스
백엔드 `learningRecord.service.summary()` 응답에 `streak`(연속 학습일) + `daily`(최근 30일 일별 시간 배열) 필드 추가. 기존 필드는 호환성 유지.

---

## 7. 백엔드 변경

### 7.1 학습 메이트 챗봇 엔드포인트 추가
| 파일 | 변경 |
|---|---|
| `services/ai.service.js` | `chatTurn({history, message})` 함수 추가. 시스템 프롬프트로 캐릭터 부여, `temperature 0.7`, `max_completion_tokens 220`. 신모델 호환을 위해 1차 실패 시 `max_tokens` 로 자동 재시도 |
| `controllers/assistant.controller.js` (신규) | 입력 검증(500자 제한) + AI 호출 실패 시 503 명시 (프론트가 mock fallback 분기 가능) |
| `routes/assistant.routes.js` (신규) | `POST /api/assistant/chat`, auth 필수 |
| `routes/index.js` | `/assistant` 라우트 등록 |

### 7.2 학습 기록 summary 확장
| 파일 | 변경 |
|---|---|
| `services/learningRecord.service.js` | `summary()` 응답에 `streak`(오늘 또는 어제부터 거꾸로 계산한 연속 학습일) + `daily`(최근 30일 일별 시간 배열) 추가. 기존 필드는 그대로 |

### 7.3 환경
- `OPENAI_MODEL` 권장값 → `gpt-4o-mini` (또는 신모델). `max_tokens` 거부 모델은 자동으로 `max_completion_tokens` 로 재시도되므로 호환성 문제 없음.

---

## 8. 발견하고 수정한 버그

### 🐛 CBT.jsx — Conditional Hooks
**증상**: `if (!certId) return <안내 화면 />`이 모든 `useState`/`useEffect`/`useRef` 호출보다 위에 있어 React Rules of Hooks 위반. 자격증 선택 안 한 사용자가 CBT 진입 시 hook 호출 순서가 달라져 잠재적 크래시 위험.

**수정**: early return을 hooks 호출 모두 끝난 다음으로 이동.

---

## 9. 손대지 않은 기존 이슈 (작업 범위 밖)

다음 이슈는 인지하고 있지만 의도된 패턴이거나 디자인 작업과 무관해 두었음.

- `AuthContext.jsx`: `setState`-in-effect 패턴 (의도된 초기화)
- `Dashboard.jsx`: catch 블록의 unused `err` 변수 2곳
- `AuthContext.jsx`: fast-refresh export 규칙 (`useAuth` hook 공용 export 때문)

---

## 10. 직접 확인할 포인트

```bash
cd Client && npm run dev
```

| 카테고리 | 체크 |
|---|---|
| 🦉 어시스턴트 | 알약 도크 라벨/펄스 ring / 페이지 이동마다 다른 멘트 / 클릭 시 챗봇 오픈 / 90초 가만히 있으면 잔소리 |
| 🦉 챗봇 (실 AI) | 자유 입력 시 typing indicator → AI 응답. 백엔드 끄면 OFFLINE 배지 + mock 응답 |
| 대시보드 위젯 | 통계 카드 4개 / 응원 배너 7초 회전 / 도넛 차트 채워짐 / 학습 잔디밭 / 추이 차트 hover tooltip |
| CBT 흐름 | 자격증 선택 후 진입 → 5문제 풀기 → 응원 멘트 / 제출 → 결과 페이지 칭찬 |
| 모의면접 setup | 큰 🎤 + 3단계 표시 + 빠른 직무 chips 8종 클릭 시 input 자동 입력 |
| 모의면접 진행 | 답변 후 점수에 따라 어시스턴트 반응 변경 |
| 모바일 | DevTools에서 480px / 768px 리사이즈 시 깨짐 없는지 |
| 키보드 | Tab 이동 시 포커스 링 보임 / 모달 ESC 닫힘 / 카드 Enter 동작 |
| 모달 3개 | 대시보드 자격증 상세, 학습 기록 추가, 일정 편집 — ESC + 오버레이 클릭 닫힘 |

---

## 11. 작업 범위 통계

| 항목 | 수량 |
|---|---|
| 신규 프론트 파일 | 28 (UI 6×2 + 어시스턴트 5 + 대시보드 위젯 4×2 + index 3) |
| 신규 백엔드 파일 | 2 (assistant 컨트롤러/라우트) |
| 수정한 백엔드 파일 | 3 (`ai.service`, `learningRecord.service`, `routes/index`) |
| 수정한 페이지 | 13 |
| 토큰화한 CSS 파일 | 7 (`dashboard`, `login`, `signup`, `roadmap`, `CBT`, `mockInterview`, `jobMatching`, `portfolio`) |
| 새 디자인 토큰 | 약 50종 |
| 어시스턴트 트리거 포인트 | 10+ |
| 신규 npm 의존성 | 1 (`recharts`) |
| 빌드 | ✅ 통과 |
