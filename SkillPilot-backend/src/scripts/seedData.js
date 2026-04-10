/**
 * 초기 데이터 부트스트랩 스크립트
 *
 * 동작 순서:
 *  1. MySQL 테이블 동기화
 *  2. data.go.kr 동기화 시도 (API 키가 있을 때)
 *  3. 그래도 Certification 이 0건이면 최소 IT 자격증 8개 폴백 시드
 *  4. MongoDB 연결 (문제은행은 AI 생성 스크립트로 별도 채움)
 *
 * 문제(Question) 하드코딩 데이터는 제거되었습니다.
 * 문제 데이터는 `npm run generate:questions` 로 AI 생성해야 합니다.
 */

require('dotenv').config();
const { sequelize, Certification } = require('../models/mysql');
const connectMongoDB = require('../config/mongodb');
const { syncCertifications } = require('../services/certificationSync.service');
const { hasAnyKey } = require('../integrations/dataGoKr/endpoints');

// data.go.kr 연동 전, 로컬 개발 환경에서 앱이 동작 가능하도록 두는 최소 부트스트랩 IT 자격증.
// source='seed' 로 기록해 실데이터와 구분합니다.
const fallbackCertifications = [
  {
    title: '정보처리기사',
    level: '국가기술',
    duration: '3-6개월',
    jobs: '소프트웨어 개발자, 시스템 엔지니어, DBA',
    exam_info: '필기(객관식 100문항) + 실기(필답형)',
    tips: '기출문제 반복 풀이가 핵심. 실기는 SQL과 알고리즘 위주로 준비',
    field: 'IT·소프트웨어',
    popularity: 95,
    source: 'seed',
  },
  {
    title: '정보보안기사',
    level: '국가기술',
    duration: '4-8개월',
    jobs: '보안 엔지니어, 보안 컨설턴트, CISO',
    exam_info: '필기(객관식 100문항) + 실기(필답형+실무형)',
    tips: '네트워크 보안, 시스템 보안 위주로 학습',
    field: '정보보안',
    popularity: 78,
    source: 'seed',
  },
  {
    title: '리눅스마스터 1급',
    level: '국가기술',
    duration: '2-4개월',
    jobs: '시스템 관리자, DevOps 엔지니어, 클라우드 엔지니어',
    exam_info: '필기(객관식 100문항) + 실기(서술형+실습)',
    tips: 'VM 환경에서 직접 실습',
    field: 'IT·인프라',
    popularity: 65,
    source: 'seed',
  },
  {
    title: 'SQLD',
    level: '민간',
    duration: '1-3개월',
    jobs: '데이터 분석가, DBA, 백엔드 개발자',
    exam_info: '객관식 50문항 (90분)',
    tips: 'SQL 기본 문법과 데이터 모델링',
    field: '데이터베이스',
    popularity: 85,
    source: 'seed',
  },
  {
    title: 'AWS Solutions Architect Associate',
    level: '국제',
    duration: '2-4개월',
    jobs: '클라우드 엔지니어, DevOps 엔지니어, 솔루션즈 아키텍트',
    exam_info: '객관식 65문항 (130분)',
    tips: 'EC2, S3, VPC, IAM 등 핵심 서비스 집중',
    field: '클라우드',
    popularity: 88,
    source: 'seed',
  },
  {
    title: '네트워크관리사 2급',
    level: '국가기술',
    duration: '2-3개월',
    jobs: '네트워크 엔지니어, 시스템 관리자',
    exam_info: '필기(객관식 80문항) + 실기(서술형)',
    tips: 'TCP/IP 기본 개념',
    field: '네트워크',
    popularity: 60,
    source: 'seed',
  },
  {
    title: 'ADsP',
    level: '민간',
    duration: '1-2개월',
    jobs: '데이터 분석가, 데이터 엔지니어',
    exam_info: '객관식 40문항 (90분)',
    tips: '통계 기초 + 데이터 분석 방법론',
    field: '데이터분석',
    popularity: 72,
    source: 'seed',
  },
  {
    title: '빅데이터분석기사',
    level: '국가기술',
    duration: '3-6개월',
    jobs: '데이터 엔지니어, 데이터 사이언티스트',
    exam_info: '필기 + 실기(작업형)',
    tips: 'Python/R 실습 위주',
    field: '데이터분석',
    popularity: 80,
    source: 'seed',
  },
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected');

    await sequelize.sync({ alter: true });
    console.log('Tables synced');

    // 1. data.go.kr 동기화 시도
    if (hasAnyKey()) {
      try {
        console.log('data.go.kr 동기화 시도 중...');
        const result = await syncCertifications();
        console.log('동기화 결과:', result);
      } catch (err) {
        console.warn('data.go.kr 동기화 실패, 폴백 시드 사용:', err.message);
      }
    } else {
      console.log('data.go.kr 서비스 키 미설정 — 폴백 시드로 진행합니다.');
    }

    // 2. Certification 이 여전히 비어있으면 폴백 시드
    const existingCount = await Certification.count();
    if (existingCount === 0) {
      await Certification.bulkCreate(fallbackCertifications);
      console.log(`폴백 자격증 ${fallbackCertifications.length}건 시드 완료`);
    } else {
      console.log(`Certification 이미 ${existingCount}건 존재 — 추가 시드 생략`);
    }

    // 3. MongoDB 연결 확인만 (문제는 AI 생성 스크립트로)
    try {
      await connectMongoDB();
      console.log('MongoDB connected (문제 데이터는 `npm run generate:questions` 로 생성하세요)');
    } catch (mongoErr) {
      console.warn('MongoDB 연결 실패:', mongoErr.message);
    }

    console.log('부트스트랩 완료');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
