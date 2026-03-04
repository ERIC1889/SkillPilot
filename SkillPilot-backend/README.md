claude --resume 9f5a1159-d878-4a82-a324-a1548af4fa2f

# SkillPilot Backend

IT 취업준비생을 위한 올인원 커리어 지원 플랫폼 백엔드 서버

## Tech Stack

- **Runtime**: Node.js + Express 5
- **MySQL**: Sequelize ORM (사용자, 프로필, 자격증, 일정, 포트폴리오)
- **MongoDB**: Mongoose ODM (문제은행, 시험결과, 로드맵, AI 분석)
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **AI**: OpenAI GPT API (자격증 추천, 로드맵 생성, 오답 분석)
- **Validation**: Joi

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DB credentials and API keys

# 3. Create MySQL database
mysql -u root -e "CREATE DATABASE skillpilot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Sync database tables
npm run db:sync

# 5. Seed initial data
npm run db:seed

# 6. Start development server
npm run dev
```

## Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm start`       | Production server            |
| `npm run dev`     | Development server (nodemon) |
| `npm run db:sync` | Sync MySQL tables            |
| `npm run db:seed` | Insert seed data             |

## API Endpoints

All endpoints prefixed with `/api`

| Module         | Base Path             | Auth    |
| -------------- | --------------------- | ------- |
| Auth           | `/api/auth`           | Partial |
| Profile        | `/api/profile`        | Yes     |
| Goals          | `/api/goals`          | Yes     |
| Certifications | `/api/certifications` | Partial |
| Roadmap        | `/api/roadmap`        | Yes     |
| Schedules      | `/api/schedules`      | Yes     |
| Portfolio      | `/api/portfolio`      | Partial |
| CBT            | `/api/cbt`            | Yes     |
| Dashboard      | `/api/dashboard`      | Yes     |

## Project Structure

```
src/
├── config/          # DB connections, env config
├── middlewares/      # Auth, validation, error handling
├── models/
│   ├── mysql/       # Sequelize models (14 tables)
│   └── mongodb/     # Mongoose schemas (6 collections)
├── routes/          # Express routers
├── controllers/     # Request/response handling
├── services/        # Business logic
├── validations/     # Joi schemas
├── utils/           # JWT, ApiError, constants
├── scripts/         # DB sync & seed
├── app.js           # Express app setup
└── server.js        # Entry point
```
