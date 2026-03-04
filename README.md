# SkillPilot

IT 취업준비생을 위한 올인원 커리어 지원 플랫폼

사용자의 문제 풀이 결과를 바탕으로 취약점을 분석하고, AI 해설과 맞춤형 학습 로드맵을 제공하는 웹 서비스입니다.

## 주요 기능

- **AI 자격증 추천** — 프로필 기반으로 적합한 IT 자격증 추천
- **CBT 모의고사** — 자격증별 문제은행 기반 온라인 시험
- **취약점 분석 대시보드** — 과목/영역별 강점·취약점 시각화 (동적 바 차트)
- **AI 오답 분석** — 틀린 문제에 대한 AI 맞춤 해설 및 학습 팁 제공
- **주간 학습 로드맵** — 분석 결과 기반 맞춤형 학습 계획 생성
- **목표 설정 & 일정 관리** — 자격증 시험 목표 및 학습 스케줄 관리
- **포트폴리오** — 자격증, 프로젝트, 활동 이력을 정리한 커리어 포트폴리오

## 기술 스택

### Frontend
| 항목 | 기술 |
|------|------|
| Framework | React 19 |
| Build Tool | Vite |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Drag & Drop | dnd-kit |
| Icons | React Icons |

### Backend
| 항목 | 기술 |
|------|------|
| Runtime | Node.js + Express 5 |
| MySQL ORM | Sequelize (사용자, 프로필, 자격증, 일정, 포트폴리오) |
| MongoDB ODM | Mongoose (문제은행, 시험결과, 로드맵, AI 분석) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI | OpenAI GPT API |
| Validation | Joi |

## 프로젝트 구조

```
SkillPilot/
├── Client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/             # 페이지 컴포넌트
│   │   ├── contexts/          # React Context (Auth)
│   │   ├── services/          # API 통신 모듈
│   │   ├── styles/            # CSS 스타일시트
│   │   └── assets/            # 이미지, 아이콘
│   └── public/
│
└── SkillPilot-backend/        # Backend (Express)
    └── src/
        ├── config/            # DB 연결, 환경설정
        ├── controllers/       # 요청/응답 처리
        ├── services/          # 비즈니스 로직
        ├── models/
        │   ├── mysql/         # Sequelize 모델 (14 테이블)
        │   └── mongodb/       # Mongoose 스키마 (6 컬렉션)
        ├── routes/            # Express 라우터
        ├── middlewares/       # 인증, 검증, 에러 핸들링
        ├── validations/       # Joi 스키마
        ├── utils/             # JWT, ApiError, 상수
        └── scripts/           # DB 동기화 & 시드 데이터
```

## API Endpoints

All endpoints prefixed with `/api`

| Module | Path | Auth |
|--------|------|------|
| Auth | `/api/auth` | Partial |
| Profile | `/api/profile` | Yes |
| Goals | `/api/goals` | Yes |
| Certifications | `/api/certifications` | Partial |
| Roadmap | `/api/roadmap` | Yes |
| Schedules | `/api/schedules` | Yes |
| Portfolio | `/api/portfolio` | Partial |
| CBT | `/api/cbt` | Yes |
| Dashboard | `/api/dashboard` | Yes |

## 설치 및 실행

### 사전 요구사항

- Node.js 18+
- MySQL 8+
- MongoDB 6+
- OpenAI API Key

### Backend

```bash
cd SkillPilot-backend

# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 DB 정보 및 API 키 입력

# MySQL 데이터베이스 생성
mysql -u root -e "CREATE DATABASE skillpilot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 테이블 동기화
npm run db:sync

# 시드 데이터 삽입
npm run db:seed

# 서버 실행 (개발 모드)
npm run dev
```

### Frontend

```bash
cd Client

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

Frontend: `http://localhost:5173` | Backend: `http://localhost:5000`

## 환경변수

`SkillPilot-backend/.env` 파일에 아래 항목을 설정합니다:

```env
NODE_ENV=development
PORT=5000

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=skillpilot

# MongoDB
MONGODB_URI=mongodb://localhost:27017/skillpilot

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo

# CORS
CORS_ORIGIN=http://localhost:5173
```
