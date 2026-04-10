# SkillPilot

IT 취업준비생을 위한 올인원 커리어 지원 플랫폼

사용자의 프로필·목표 기반으로 IT 자격증을 추천하고, 공공데이터(data.go.kr)로 실시간 자격증/시험일정을 동기화하며, AI 기반 로드맵·CBT 모의고사·오답분석·모의면접·채용매칭을 제공합니다.

## 사용자 플로우

```
로그인 → 프로필 입력 → 목표 설정 → AI 자격증 추천 → 자격증 선택
      → 맞춤 로드맵 생성 → 학습 → CBT 모의고사 → AI 오답 분석
      → 포트폴리오 구축 → 스킬갭 분석 → AI 모의면접 → 채용 매칭
```

플로우의 각 단계는 `OnboardingGuard`(`Client/src/App.jsx`)가 강제합니다.
이전 단계가 미완료면 해당 페이지로 자동 리디렉트됩니다.

## 주요 기능

- **공공데이터 자격증 동기화** — data.go.kr 7종 API 연동, IT 자격증만 필터링, node-cron 으로 매일/매주 자동 동기화
- **AI 자격증 추천** — 프로필·목표 기반 GPT 추천 (결과는 MongoDB 에 캐싱)
- **AI 맞춤 로드맵** — 자격증별 주차 계획을 AI 가 생성, 드래그 재정렬 & 편집 백엔드 영속
- **CBT 모의고사** — 문제 부족 시 AI 가 과목별 자동 생성, 실시간 채점
- **AI 오답 분석** — 틀린 문제별 상세 해설과 학습 팁 자동 생성
- **학습 기록** — 일/주/월 기준 학습 시간 집계 및 대시보드 표시
- **AI 모의면접** — 지원 직무 기반 연속 대화형 기술 면접, 턴별 피드백·점수
- **스킬갭 분석** — 목표 직무 대비 부족 스킬·추천 학습 순서 AI 생성
- **채용 매칭** — 보유 스킬·자격증·목표 직무 가중치 기반 매칭 점수 산출
- **포트폴리오** — 스킬, 자격증, 프로젝트, 활동, 링크 편집 & 프리뷰
- **관리자 API** — `X-Admin-Key` 헤더 기반 동기화·문제 생성 트리거

## 기술 스택

### Frontend
| 항목 | 기술 |
|------|------|
| Framework | React 19 (Vite SPA) |
| Routing | React Router v7 + `OnboardingGuard` |
| HTTP Client | Axios (JWT 인터셉터) |
| Drag & Drop | dnd-kit |
| Icons | React Icons |

### Backend
| 항목 | 기술 |
|------|------|
| Runtime | Node.js + Express 5 |
| MySQL ORM | Sequelize |
| MongoDB ODM | Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI | OpenAI GPT (추천/로드맵/문제생성/오답분석/모의면접/스킬갭) |
| 공공데이터 | fast-xml-parser (data.go.kr XML 파싱) |
| 스케줄러 | node-cron |
| Validation | Joi |

## 프로젝트 구조

```
SkillPilot/
├── Client/                            # React + Vite SPA
│   ├── src/
│   │   ├── pages/                     # Login, Signup, ProfileSetup, GoalSetting,
│   │   │                               # CertificationRecommendation, WeeklyRoadmap,
│   │   │                               # Dashboard, CBT, AnswerAnalyze, Portfolio,
│   │   │                               # PortfolioPreview, MockInterview, JobMatching
│   │   ├── contexts/AuthContext.jsx   # 온보딩 상태 관리
│   │   ├── services/api.js            # Axios 인스턴스
│   │   └── styles/
│   └── vite.config.js
│
└── SkillPilot-backend/                # Express 백엔드
    └── src/
        ├── config/                    # DB, JWT, OpenAI, data.go.kr, 스케줄러
        ├── controllers/               # auth, cbt, certification, dashboard, goal,
        │                               # portfolio, profile, roadmap, schedule,
        │                               # notice, learningRecord, mockInterview,
        │                               # skillGap, job, admin
        ├── services/                  # 위 controllers 대응 + certificationSync,
        │                               # questionBank, ai
        ├── models/
        │   ├── mysql/                 # User, Profile, Goal, Certification, ExamSchedule,
        │   │                           # UserCertification, Schedule, Notice, Portfolio*,
        │   │                           # Job
        │   └── mongodb/               # Question, TestResult, WrongAnswerNote,
        │                               # RoadmapData, LearningRecord, AIAnalysis,
        │                               # MockInterviewSession
        ├── integrations/dataGoKr/     # 공공데이터포털 클라이언트/엔드포인트/필터/정규화
        ├── schedulers/                # node-cron 등록 (자격증/시험일정 동기화)
        ├── routes/                    # Express 라우터
        ├── middlewares/               # auth, adminAuth, validate, errorHandler, asyncHandler
        ├── validations/               # Joi 스키마
        ├── utils/                     # JWT, ApiError
        └── scripts/                   # seedData, syncCertifications, syncExamSchedules,
                                        # generateQuestions, syncDb
```

## API Endpoints (발췌)

모든 엔드포인트 prefix `/api`.

| 모듈 | 경로 | 인증 |
|------|------|------|
| Auth | `/auth/{register,login,me}` | Partial |
| Profile / Goal | `/profile`, `/goals` | Yes |
| Certifications | `/certifications{,/recommended,/rankings,/filter-options,/select,/:id}` | Partial |
| Roadmap | `/roadmap{,/generate,/reorder,/weeks,/weeks/:id,/priority}` | Yes |
| Schedules | `/schedules{,/:id}` | Yes |
| Portfolio | `/portfolio/*` | Yes |
| CBT | `/cbt/{questions,submit,results/:id}` | Yes |
| Dashboard | `/dashboard` | Yes |
| Notices | `/notices` (GET public, POST/DELETE admin) | Mixed |
| Learning Records | `/learning-records{,/summary,/:id}` | Yes |
| Mock Interview | `/mock-interview/{start,:id,:id/answer}` | Yes |
| Skill Gap | `/skill-gap` | Yes |
| Jobs | `/jobs{,/matches}` | Partial |
| Admin | `/admin/{sync/certifications,sync/exam-schedules,generate-questions}` | X-Admin-Key |

## 설치 및 실행

### 사전 요구사항
- Node.js 18+
- MySQL 8+
- MongoDB 6+ (선택 — 없어도 기본 기능 동작, CBT/모의면접/로드맵 제한)
- OpenAI API Key
- data.go.kr 서비스 키 (선택 — 없으면 폴백 시드 사용)

### Backend

```bash
cd SkillPilot-backend

npm install
cp .env.example .env
# .env 파일에 DB / OpenAI / data.go.kr / Admin 키 입력

# MySQL 데이터베이스 생성
mysql -u root -e "CREATE DATABASE skillpilot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 테이블 생성
npm run db:sync

# 초기 부트스트랩 (data.go.kr 동기화 시도 + 폴백 시드)
npm run db:seed

# 자격증 수동 동기화 (data.go.kr)
npm run sync:certifications

# 시험일정 수동 동기화
npm run sync:exams

# 자격증별 AI 문제 벌크 생성 (과목당 15문항)
npm run generate:questions

# 개발 서버 실행
npm run dev
```

### Frontend

```bash
cd Client
npm install
npm run dev
```

Frontend: `http://localhost:5173` | Backend: `http://localhost:5000`

## 환경변수

`SkillPilot-backend/.env.example` 참조. 핵심 항목:

```env
# MySQL / MongoDB
MYSQL_HOST=localhost
MYSQL_DATABASE=skillpilot
MONGODB_URI=mongodb://localhost:27017/skillpilot

# JWT
JWT_SECRET=change_me_to_a_long_random_string

# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# 공공데이터포털 (data.go.kr)
DATA_GO_KR_API_KEY=

# 스케줄러
SCHEDULER_ENABLED=true
CRON_CERT_SYNC=0 4 * * *      # 매일 04:00 자격증 동기화
CRON_EXAM_SYNC=0 5 * * 1      # 매주 월 05:00 시험일정 동기화

# 관리자 API
ADMIN_API_KEY=
```

## 데이터 소스

### 공공데이터포털 (data.go.kr) — IT 자격증만 필터링
| ID | 엔드포인트 키 | 용도 |
|----|--------------|------|
| 15003024 | `nationalTechDetail` | 국가기술자격 종목 상세정보 |
| 15003027 | `nationalTechStats` | 국가기술자격 합격률 통계 |
| 15003029 | `nationalTechSchedule` | 국가기술자격 시험일정 |
| 15074408 | `nationalTechExamInfo` | 국가기술자격 시험 과목/문항수 |
| 15041600 | `nationalProDetail` | 국가전문자격 종목 정보 |
| 15039800 | `nationalProSchedule` | 국가전문자격 시험일정 |
| 15075141 | `privateQualInfo` | 민간자격 정보 |

필터는 `src/integrations/dataGoKr/itFilter.js` 에서 키워드 기반으로 IT 관련만 추출합니다.

### AI 생성
- **문제은행** — 자격증별 문제가 없거나 부족하면 `generateQuestions` 로 과목별 자동 생성
- **로드맵** — 주차별 학습 계획을 GPT 가 생성, 실패 시 규칙 기반 폴백
- **오답 분석** — 틀린 문제별 해설·팁을 GPT 가 생성
- **모의면접** — 턴 단위 기술 질문·피드백을 GPT 가 생성
- **스킬갭 분석** — 목표 직무 대비 강점·부족 스킬을 GPT 가 분석

## 보안 주의

- `.env` 파일은 **절대 커밋하지 마세요** (양쪽 `.gitignore` 로 보호됨)
- OpenAI API 키가 과거에 노출된 적이 있다면 **즉시 로테이션**하세요
- `ADMIN_API_KEY` 는 관리자 엔드포인트 보호용 — 강력한 랜덤 값으로 설정하세요
