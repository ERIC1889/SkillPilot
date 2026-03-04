require('dotenv').config();
const { sequelize, Certification } = require('../models/mysql');
const connectMongoDB = require('../config/mongodb');
const Question = require('../models/mongodb/Question');

const certifications = [
  {
    title: '정보처리기사',
    level: '국가기술',
    duration: '3-6개월',
    jobs: '소프트웨어 개발자, 시스템 엔지니어, DBA',
    exam_info: '필기(객관식 100문항) + 실기(필답형)',
    tips: '기출문제 반복 풀이가 핵심. 실기는 SQL과 알고리즘 위주로 준비',
    field: 'IT·소프트웨어',
    popularity: 95,
  },
  {
    title: '정보보안기사',
    level: '국가기술',
    duration: '4-8개월',
    jobs: '보안 엔지니어, 보안 컨설턴트, CISO',
    exam_info: '필기(객관식 100문항) + 실기(필답형+실무형)',
    tips: '네트워크 보안, 시스템 보안 위주로 학습. 실기는 실습 경험 필요',
    field: '정보보안',
    popularity: 78,
  },
  {
    title: '리눅스마스터 1급',
    level: '국가기술',
    duration: '2-4개월',
    jobs: '시스템 관리자, DevOps 엔지니어, 클라우드 엔지니어',
    exam_info: '필기(객관식 100문항) + 실기(서술형+실습)',
    tips: '리눅스 명령어와 시스템 관리 실습 위주. VM 환경에서 직접 연습',
    field: 'IT·인프라',
    popularity: 65,
  },
  {
    title: 'SQLD (SQL 개발자)',
    level: '민간',
    duration: '1-3개월',
    jobs: '데이터 분석가, DBA, 백엔드 개발자',
    exam_info: '객관식 50문항 (90분)',
    tips: 'SQL 기본 문법과 데이터 모델링 개념 정리가 중요',
    field: '데이터베이스',
    popularity: 85,
  },
  {
    title: 'AWS Solutions Architect Associate',
    level: '국제',
    duration: '2-4개월',
    jobs: '클라우드 엔지니어, DevOps 엔지니어, 솔루션즈 아키텍트',
    exam_info: '객관식 65문항 (130분, 영어/한국어)',
    tips: 'AWS 공식 교육자료와 실습 랩 활용. 핵심 서비스(EC2, S3, VPC, IAM) 집중',
    field: '클라우드',
    popularity: 88,
  },
  {
    title: '네트워크관리사 2급',
    level: '국가기술',
    duration: '2-3개월',
    jobs: '네트워크 엔지니어, 시스템 관리자',
    exam_info: '필기(객관식 80문항) + 실기(서술형)',
    tips: 'TCP/IP 기본 개념과 네트워크 장비 설정 위주로 학습',
    field: '네트워크',
    popularity: 60,
  },
  {
    title: 'ADSP (데이터분석 준전문가)',
    level: '민간',
    duration: '1-2개월',
    jobs: '데이터 분석가, 데이터 엔지니어, 비즈니스 분석가',
    exam_info: '객관식 40문항 (90분)',
    tips: '통계 기초와 데이터 분석 방법론 개념 위주로 준비',
    field: '데이터분석',
    popularity: 72,
  },
  {
    title: '정보처리산업기사',
    level: '국가기술',
    duration: '2-4개월',
    jobs: '소프트웨어 개발자, 웹 개발자, IT 운영',
    exam_info: '필기(객관식 80문항) + 실기(필답형)',
    tips: '정보처리기사보다 난이도가 낮지만 기본 개념은 동일. 기출 중심 학습',
    field: 'IT·소프트웨어',
    popularity: 70,
  },
];

const sampleQuestions = [
  // 정보처리기사 (certificationId: 1)
  {
    certificationId: 1,
    subject: '소프트웨어 설계',
    question: '객체지향 설계 원칙 중 SOLID 원칙에 해당하지 않는 것은?',
    options: ['단일 책임 원칙', '개방-폐쇄 원칙', '다중 상속 원칙', '인터페이스 분리 원칙'],
    correctIndex: 2,
    difficulty: '중',
    explanation: 'SOLID 원칙은 SRP, OCP, LSP, ISP, DIP로 구성됩니다. 다중 상속 원칙은 SOLID에 포함되지 않습니다.',
    tags: ['OOP', 'SOLID', '설계원칙'],
  },
  {
    certificationId: 1,
    subject: '소프트웨어 설계',
    question: 'UML 다이어그램 중 시스템의 동적 행위를 표현하는 것으로만 묶인 것은?',
    options: [
      '클래스 다이어그램, 시퀀스 다이어그램',
      '시퀀스 다이어그램, 상태 다이어그램',
      '배치 다이어그램, 컴포넌트 다이어그램',
      '패키지 다이어그램, 객체 다이어그램',
    ],
    correctIndex: 1,
    difficulty: '중',
    explanation: '시퀀스 다이어그램과 상태 다이어그램은 모두 동적 다이어그램입니다.',
    tags: ['UML', '다이어그램'],
  },
  {
    certificationId: 1,
    subject: '데이터베이스',
    question: '관계형 데이터베이스에서 정규화의 주된 목적은?',
    options: ['검색 속도 향상', '데이터 중복 최소화', '테이블 수 감소', '인덱스 자동 생성'],
    correctIndex: 1,
    difficulty: '하',
    explanation: '정규화는 데이터 중복을 최소화하고 이상현상을 방지하기 위한 과정입니다.',
    tags: ['DB', '정규화'],
  },
  {
    certificationId: 1,
    subject: '데이터베이스',
    question: 'SQL에서 GROUP BY와 함께 조건을 지정할 때 사용하는 절은?',
    options: ['WHERE', 'HAVING', 'ORDER BY', 'SET'],
    correctIndex: 1,
    difficulty: '하',
    explanation: 'HAVING 절은 GROUP BY로 그룹화된 결과에 조건을 적용할 때 사용합니다.',
    tags: ['SQL', 'GROUP BY'],
  },
  {
    certificationId: 1,
    subject: '프로그래밍 언어',
    question: '스택(Stack)의 특성으로 올바른 것은?',
    options: ['FIFO 구조', 'LIFO 구조', '랜덤 접근', '양방향 삽입'],
    correctIndex: 1,
    difficulty: '하',
    explanation: '스택은 Last In First Out(LIFO) 구조로, 마지막에 삽입된 요소가 먼저 삭제됩니다.',
    tags: ['자료구조', '스택'],
  },
  // SQLD (certificationId: 4)
  {
    certificationId: 4,
    subject: 'SQL 기본',
    question: 'SELECT 문에서 중복된 행을 제거하는 키워드는?',
    options: ['UNIQUE', 'DISTINCT', 'DIFFERENT', 'SEPARATE'],
    correctIndex: 1,
    difficulty: '하',
    explanation: 'DISTINCT 키워드는 SELECT 결과에서 중복된 행을 제거합니다.',
    tags: ['SQL', 'SELECT'],
  },
  {
    certificationId: 4,
    subject: 'SQL 기본',
    question: '다음 중 DDL(Data Definition Language)에 해당하는 것은?',
    options: ['SELECT', 'INSERT', 'CREATE', 'UPDATE'],
    correctIndex: 2,
    difficulty: '하',
    explanation: 'CREATE, ALTER, DROP, TRUNCATE 등이 DDL에 해당합니다.',
    tags: ['SQL', 'DDL'],
  },
  {
    certificationId: 4,
    subject: '데이터 모델링',
    question: 'ERD에서 엔터티 간의 관계를 나타내는 기호가 아닌 것은?',
    options: ['1:1', '1:N', 'N:M', '1:0'],
    correctIndex: 3,
    difficulty: '중',
    explanation: 'ERD에서 관계는 1:1, 1:N, N:M으로 표현합니다. 1:0은 표준 관계 표기가 아닙니다.',
    tags: ['ERD', '데이터모델링'],
  },
  // AWS SAA (certificationId: 5)
  {
    certificationId: 5,
    subject: 'Compute',
    question: 'EC2 인스턴스 유형 중 메모리 최적화에 해당하는 것은?',
    options: ['t3.micro', 'c5.large', 'r5.xlarge', 'm5.large'],
    correctIndex: 2,
    difficulty: '중',
    explanation: 'R 시리즈는 메모리 최적화 인스턴스입니다. C는 컴퓨팅, T는 범용(버스트), M은 범용입니다.',
    tags: ['EC2', '인스턴스유형'],
  },
  {
    certificationId: 5,
    subject: 'Storage',
    question: 'S3 스토리지 클래스 중 가장 저렴하지만 검색 시간이 가장 긴 것은?',
    options: ['S3 Standard', 'S3 Standard-IA', 'S3 One Zone-IA', 'S3 Glacier Deep Archive'],
    correctIndex: 3,
    difficulty: '중',
    explanation: 'S3 Glacier Deep Archive는 가장 저렴하지만 검색에 최대 12시간이 소요됩니다.',
    tags: ['S3', '스토리지클래스'],
  },
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected');

    // Sync tables
    await sequelize.sync({ alter: true });
    console.log('Tables synced');

    // Seed certifications
    const existingCount = await Certification.count();
    if (existingCount === 0) {
      await Certification.bulkCreate(certifications);
      console.log(`${certifications.length} certifications seeded`);
    } else {
      console.log('Certifications already exist, skipping');
    }

    // Seed questions (MongoDB - optional)
    try {
      await connectMongoDB();
      const questionCount = await Question.countDocuments();
      if (questionCount === 0) {
        await Question.insertMany(sampleQuestions);
        console.log(`${sampleQuestions.length} questions seeded`);
      } else {
        console.log('Questions already exist, skipping');
      }
    } catch (mongoErr) {
      console.warn('MongoDB not available, skipping question seeding:', mongoErr.message);
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
