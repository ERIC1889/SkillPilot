import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css';
import CBT from './CBT';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

// --- Icons ---
const DiplomaIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d3e5d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>);
const TargetIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d3e5d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>);
const CalendarIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d3e5d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const HomeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>);
const DocIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>);
const SearchIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const UserIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const CloseIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const CheckIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
const FilterIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>);
const ChevronRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>);
const GradCapIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d3e5d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>);
const SettingsIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
const ClockIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);
const TrophyIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>);
const LogOutIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [scheduleViewMode, setScheduleViewMode] = useState('calendar');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    year: '', month: '', day: '',
    goal: '', amount: '', schedule: '', status: 'incomplete'
  });
  const [filterDifficulty, setFilterDifficulty] = useState('전체');
  const [filterField, setFilterField] = useState('전체');
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setDashboardData(res.data.data))
      .catch(() => {});
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCertModal = () => setIsCertModalOpen(!isCertModalOpen);

  const handlePageChange = (tab) => {
    setCurrentTab(tab);
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // --- Data ---
  const calendarDays = [
    { day: '', type: 'empty' }, { day: '', type: 'empty' }, { day: '', type: 'empty' }, { day: '', type: 'empty' }, { day: '', type: 'empty' }, { day: '', type: 'empty' },
    { day: 1, type: 'default' }, { day: 2, type: 'default' }, { day: 3, type: 'default' }, { day: 4, type: 'default' },
    { day: 5, type: 'done', statusLabel: '완료', goal: '알고리즘 기초 학습', amount: '챕터 1-3 (약 50페이지)' },
    { day: 6, type: 'default' }, { day: 7, type: 'default' },
    { day: 8, type: 'done', statusLabel: '완료', goal: '자료구조 심화 복습', amount: '연습문제 10문항' },
    { day: 9, type: 'default' }, { day: 10, type: 'default' }, { day: 11, type: 'default' },
    { day: 12, type: 'scheduled', statusLabel: '예정', goal: '알고리즘 문제풀이', amount: '백준 5문제' },
    { day: 13, type: 'default' }, { day: 14, type: 'default' },
    { day: 15, type: 'scheduled', statusLabel: '예정', goal: '데이터베이스 설계', amount: '프로젝트 실습 1개' },
    { day: 16, type: 'default' }, { day: 17, type: 'default' }, { day: 18, type: 'default' },
    { day: 19, type: 'scheduled', statusLabel: '예정', goal: '운영체제 개념 정리', amount: '챕터 4-6' },
    { day: 20, type: 'default' }, { day: 21, type: 'default' },
    { day: 22, type: 'scheduled', statusLabel: '예정', goal: '네트워크 프로토콜 학습', amount: '강의 3개 시청' },
    { day: 23, type: 'default' }, { day: 24, type: 'default' }, { day: 25, type: 'default' },
    { day: 26, type: 'scheduled', statusLabel: '예정', goal: '최종 복습 및 정리', amount: '오답노트 정리' },
    { day: 27, type: 'default' }, { day: 28, type: 'default' },
    { day: 29, type: 'scheduled', statusLabel: '예정', goal: '모의고사 마무리', amount: '전범위 모의고사' },
    { day: 30, type: 'default' }
  ];

  const scheduleListData = [
    { date: '5일', fullDate: '2025년 11월', title: '알고리즘 기초 학습', sub1: '학습 분량: 챕터 1-3 (약 50페이지)', sub2: '예정: 오후 2시 온라인 강의', status: 'done' },
    { date: '8일', fullDate: '2025년 11월', title: '자료구조 심화 복습', sub1: '학습 분량: 연습문제 10문항', sub2: '예정: 저녁 7시 스터디 그룹', status: 'done' },
    { date: '12일', fullDate: '2025년 11월', title: '알고리즘 문제풀이', sub1: '학습 분량: 백준 5문제', sub2: '예정: 모의고사 1회차', status: 'scheduled' },
    { date: '15일', fullDate: '2025년 11월', title: '데이터베이스 설계', sub1: '학습 분량: 프로젝트 실습 1개', sub2: '예정: 멘토링 세션 오후 3시', status: 'scheduled' },
    { date: '19일', fullDate: '2025년 11월', title: '운영체제 개념 정리', sub1: '학습 분량: 챕터 4-6', sub2: '예정: 모의고사 2회차', status: 'scheduled' },
    { date: '22일', fullDate: '2025년 11월', title: '네트워크 프로토콜 학습', sub1: '학습 분량: 강의 3개 시청', sub2: '예정: 실전 모의고사', status: 'scheduled' },
    { date: '26일', fullDate: '2025년 11월', title: '최종 복습 및 정리', sub1: '학습 분량: 오답노트 정리', sub2: '예정: 최종 점검', status: 'scheduled' },
    { date: '29일', fullDate: '2025년 11월', title: '모의고사 마무리', sub1: '학습 분량: 전범위 모의고사', sub2: '예정: 실전 시험 대비', status: 'scheduled' },
  ];

  const noticeData = [
    { type: '공지사항', date: '2025-11-25', title: '2025년 정보처리기사 시험 일정 안내' },
    { type: '학습 팁', date: '2025-11-23', title: '빅데이터분석기사 합격 후기 및 팁' },
    { type: '학습 팁', date: '2025-11-20', title: 'SQLD 단기 합격 전략' },
  ];

  const studyTips = [
    { icon: '📖', title: '효율적인 알고리즘 학습법', desc: '문제를 먼저 풀어보고, 해설을 보며 다양한 접근법을 학습하세요. 반복 학습이 핵심입니다.' },
    { icon: '🏅', title: 'CBT 모의고사 활용 팁', desc: '실전과 동일한 환경에서 시간 제한을 두고 연습하면 실전 감각을 키울 수 있습니다.' },
    { icon: '📅', title: '자격증 시험 D-30 체크리스트', desc: '약점 보완, 오답노트 정리, 모의고사 3회 이상 풀이를 완료하세요.' },
  ];

  const recommendedCerts = [
    { title: '정보처리기사', tags: ['중급', 'IT/개발'], popularity: 95, duration: '3-6개월' },
    { title: '빅데이터분석기사', tags: ['고급', '데이터 분석'], popularity: 88, duration: '4-8개월' },
    { title: 'SQLD', tags: ['초급-중급', '데이터 분석'], popularity: 92, duration: '2-3개월' },
    { title: '정보보안기사', tags: ['고급', '보안'], popularity: 85, duration: '4-6개월' },
    { title: '네트워크관리사', tags: ['중급', '네트워크'], popularity: 78, duration: '2-4개월' },
    { title: 'AWS Solutions Architect', tags: ['고급', 'IT/개발'], popularity: 90, duration: '3-5개월' },
  ];

  const certRankings = [
    { rank: 1, name: '정보처리기사', growth: '+15%' },
    { rank: 2, name: 'SQLD', growth: '+22%' },
    { rank: 3, name: 'AWS Solutions Architect', growth: '+18%' },
    { rank: 4, name: '빅데이터분석기사', growth: '+12%' },
    { rank: 5, name: 'CCNA', growth: '+8%' },
  ];

  const userName = user?.name || '사용자';
  const userInfo = {
    name: userName,
    id: user?.email?.split('@')[0] || 'user',
    email: user?.email || '',
    joinedDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : ''
  };

  const myActivityStats = [
    { label: '총 학습 시간', value: dashboardData?.monthlyStudyHours ? `${dashboardData.monthlyStudyHours}시간` : '0시간', sub: '이번 달 기준', icon: <ClockIcon /> },
    { label: '취득 자격증', value: dashboardData?.certCount ? `${dashboardData.certCount}개` : '0개', sub: '준비중 포함', icon: <DiplomaIcon /> },
    { label: '로드맵 진행', value: dashboardData?.roadmapWeeks ? `${dashboardData.roadmapWeeks}주` : '0주', sub: '전체 학습 주차', icon: <TrophyIcon /> },
  ];

  const mySettings = [
    { label: '계정 및 개인정보 설정', icon: <UserIcon /> },
    { label: '알림 설정', icon: <SettingsIcon /> },
    { label: '로그아웃', icon: <LogOutIcon />, action: handleLogout },
  ];

  // --- Event handlers ---
  const handleEditClick = (item) => {
    setEditFormData({
      year: '2025', month: '11', day: item.date.replace('일', ''),
      goal: item.title, amount: item.sub1.replace('학습 분량: ', ''),
      schedule: item.sub2.replace('예정: ', ''), status: item.status === 'done' ? 'complete' : 'incomplete'
    });
    setIsEditModalOpen(true);
  };
  const handleEditClose = () => setIsEditModalOpen(false);
  const handleEditSave = () => { alert("일정이 수정되었습니다!"); setIsEditModalOpen(false); };
  const handleFormChange = (e) => { const { name, value } = e.target; setEditFormData(prev => ({ ...prev, [name]: value })); };

  if (currentTab === 'cbt') {
    return <CBT onExit={() => handlePageChange('dashboard')} />;
  }

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="brand" onClick={() => handlePageChange('dashboard')} style={{cursor: 'pointer'}}>
          <img src="/SPLogo.png" alt="logo" onError={(e) => e.target.style.display='none'} />
          <span>SkillPilot 대시보드</span>
        </div>
        <button className="menu-btn" onClick={toggleSidebar}>☰</button>
      </header>

      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={toggleSidebar}></div>
      <aside className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>메뉴</h2>
          <button className="close-btn" onClick={toggleSidebar}><CloseIcon /></button>
        </div>
        <nav className="sidebar-menu">
          <button className={`sidebar-item ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => handlePageChange('dashboard')}><HomeIcon /> 대시보드</button>
          <button className={`sidebar-item ${currentTab === 'schedule' ? 'active' : ''}`} onClick={() => handlePageChange('schedule')}><CalendarIcon /> 일정 관리</button>
          <button className={`sidebar-item ${currentTab === 'info' ? 'active' : ''}`} onClick={() => handlePageChange('info')}><DocIcon /> 정보 제공</button>
          <button className={`sidebar-item ${currentTab === 'search' ? 'active' : ''}`} onClick={() => handlePageChange('search')}><SearchIcon /> 자격증 탐색</button>
          <button className={`sidebar-item ${currentTab === 'mypage' ? 'active' : ''}`} onClick={() => handlePageChange('mypage')}><UserIcon /> 마이페이지</button>
        </nav>
      </aside>

      {isCertModalOpen && (
        <div className="modal-overlay" onClick={toggleCertModal}>
          <div className="cert-modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>정보처리기사</h2><button className="close-btn" onClick={toggleCertModal}><CloseIcon /></button></div>
            <div className="modal-body-content">
              <div className="info-group"><p className="info-label">자격증명</p><p className="info-value">정보처리기사</p></div>
              <div className="info-group"><p className="info-label">난이도</p><p className="info-value">중급</p></div>
              <div className="info-group"><p className="info-label">준비기간</p><p className="info-value">3-6개월</p></div>
              <div className="info-group">
                <p className="info-label">관련 직무</p>
                <div className="job-tags"><span className="job-tag">백엔드 개발자</span><span className="job-tag">시스템 분석가</span></div>
              </div>
              <div className="info-group"><p className="info-label">시험 일정</p><p className="info-value">2025년 12월 1일 (일요일) 오전 9시</p></div>
              <div className="info-group">
                <p className="info-label">준비 팁</p>
                <ul className="tip-list"><li>기출문제를 3회 이상 반복하세요</li><li>SQL 쿼리 작성을 연습하세요</li></ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay" onClick={handleEditClose}>
          <div className="edit-form-card" onClick={e => e.stopPropagation()}>
            <div className="form-date-row">
              <div className="form-group date-group"><label>년도</label><input type="text" name="year" value={editFormData.year} onChange={handleFormChange} /></div>
              <div className="form-group date-group"><label>월</label><input type="text" name="month" value={editFormData.month} onChange={handleFormChange} /></div>
              <div className="form-group date-group"><label>일</label><input type="text" name="day" value={editFormData.day} onChange={handleFormChange} /></div>
            </div>
            <div className="form-group"><label>학습 목표</label><input type="text" name="goal" value={editFormData.goal} onChange={handleFormChange} /></div>
            <div className="form-group"><label>학습 분량</label><input type="text" name="amount" value={editFormData.amount} onChange={handleFormChange} /></div>
            <div className="form-group"><label>예정된 시험/강의</label><input type="text" name="schedule" value={editFormData.schedule} onChange={handleFormChange} /></div>
            <div className="form-group"><label>완료 여부</label>
              <div className="status-toggle-group">
                <button className={`status-btn ${editFormData.status === 'incomplete' ? 'active-incomplete' : ''}`} onClick={() => setEditFormData({...editFormData, status: 'incomplete'})}>미완료</button>
                <button className={`status-btn ${editFormData.status === 'complete' ? 'active-complete' : ''}`} onClick={() => setEditFormData({...editFormData, status: 'complete'})}>완료</button>
              </div>
            </div>
            <div className="form-actions"><button className="cancel-form-btn" onClick={handleEditClose}>취소</button><button className="save-form-btn" onClick={handleEditSave}>저장</button></div>
          </div>
        </div>
      )}

      <main className="dashboard-main-content">
        {currentTab === 'dashboard' && (
          <div className="tab-dashboard">
            <section className="dashboard-card welcome-card">
              <div className="welcome-text"><h2>안녕하세요, {userName}님! 👋</h2><p>오늘도 목표를 향해 한 걸음 나아가볼까요?</p></div>
              <button className="dark-btn" onClick={() => navigate("/portfolio")}>내 포트폴리오로 이동</button>
            </section>

            <section className="dashboard-card cert-card">
              <div className="card-left"><div className="icon-box blue-bg"><DiplomaIcon /></div><div><h3>정보처리기사 <span className="d-day">D-30</span></h3><p className="sub-text">시험일: 2025년 12월 1일 (일요일) 오전 9시</p></div></div>
              <button className="light-btn" onClick={toggleCertModal}>상세보기</button>
            </section>

            <div className="dashboard-grid">
              <div className="dashboard-card roadmap-card">
                <div className="card-header"><TargetIcon /><h3>학습 로드맵</h3></div>
                <div className="roadmap-list">
                  <div className="roadmap-item completed"><span className="check-icon">✔</span><span>프로그래밍 기초 이론</span></div>
                  <div className="roadmap-item completed"><span className="check-icon">✔</span><span>자료구조 심화 학습</span></div>
                  <div className="roadmap-item active"><span className="check-icon active-check">✔</span><span>알고리즘 문제풀이</span><span className="status-badge">진행중</span></div>
                  <div className="roadmap-item"><span className="check-icon empty"></span><span>데이터베이스 기초</span></div>
                </div>
                <div className="progress-section">
                  <div className="progress-info"><span>전체 진행률</span><span className="percent">50%</span></div>
                  <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '50%' }}></div></div>
                </div>
                <div className="other-certs">
                  <p>다른 자격증 검색</p>
                  <div className="tags"><span className="tag">빅데이터분석기사 ⓘ</span><span className="tag">SQLD ⓘ</span></div>
                </div>
              </div>

              <div className="dashboard-card calendar-card">
                <div className="card-header"><CalendarIcon /><h3>학습 캘린더</h3></div>
                <div className="calendar-content">
                  <h4 className="month-title">2025년 11월</h4>
                  <div className="calendar-grid">
                    {['일','월','화','수','목','금','토'].map(d => (<div key={d} className="day-name">{d}</div>))}
                    {calendarDays.map((date, idx) => (
                      <div key={idx} className={`date-cell ${date.type}`}>
                        {date.day}
                        {date.goal && (
                          <div className="hover-popup">
                            <div className="popup-header"><span className="popup-date">{date.day}일</span><span className={`popup-badge ${date.type === 'done' ? 'badge-done' : 'badge-scheduled'}`}>{date.statusLabel}</span></div>
                            <div className="popup-body"><div className="popup-item"><p className="popup-label">학습 목표</p><p className="popup-content">{date.goal}</p></div></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <section className="dashboard-card cbt-card">
              <div className="card-left"><div className="icon-box blue-bg"><GradCapIcon /></div><div><h3>CBT 모의고사</h3><p className="sub-text">실전처럼 연습하고 실력을 점검하세요</p></div></div>
              <button className="dark-btn" onClick={() => handlePageChange('cbt')}>CBT 모의고사 시작</button>
            </section>
          </div>
        )}

        {currentTab === 'schedule' && (
          <div className="tab-schedule">
            <div className="view-toggle-container">
              <button className={`toggle-btn ${scheduleViewMode === 'calendar' ? 'active' : ''}`} onClick={() => setScheduleViewMode('calendar')}>캘린더 보기</button>
              <button className={`toggle-btn ${scheduleViewMode === 'list' ? 'active' : ''}`} onClick={() => setScheduleViewMode('list')}>일정 관리</button>
            </div>
            <div className="schedule-content-box">
              {scheduleViewMode === 'calendar' ? (
                <div className="big-calendar-view">
                  <div className="calendar-header-center"><CalendarIcon /> <h3>2025년 11월</h3></div>
                  <div className="calendar-grid big-grid">
                    {['일','월','화','수','목','금','토'].map(d => (<div key={d} className="day-name">{d}</div>))}
                    {calendarDays.map((date, idx) => (
                      <div key={idx} className={`date-cell big-cell ${date.type}`}>
                        {date.day}
                        {date.goal && (
                          <div className="hover-popup">
                            <div className="popup-header"><span className="popup-date">{date.day}일</span><span className={`popup-badge ${date.type === 'done' ? 'badge-done' : 'badge-scheduled'}`}>{date.statusLabel}</span></div>
                            <div className="popup-body">
                              <div className="popup-item"><p className="popup-label">학습 목표</p><p className="popup-content">{date.goal}</p></div>
                              <div className="popup-item"><p className="popup-label">학습 분량</p><p className="popup-content">{date.amount}</p></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="schedule-list-view">
                  <h3 className="list-view-title">전체 일정</h3>
                  <div className="schedule-list-container">
                    {scheduleListData.map((item, index) => (
                      <div className="schedule-list-item clickable" key={index} onClick={() => handleEditClick(item)}>
                        <div className="list-date-box"><span className="small-year">{item.fullDate}</span><span className="big-date">{item.date}</span></div>
                        <div className="list-info-box">
                          <h4 className="list-title">{item.title}</h4>
                          <p className="list-desc">{item.sub1}</p>
                          <p className="list-desc">{item.sub2}</p>
                        </div>
                        <div className="list-status-box">
                          {item.status === 'done' ? <span className="status-pill done"><CheckIcon /> 완료</span> : <span className="status-pill scheduled">예정</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentTab === 'info' && (
          <div className="tab-info">
            <h2 className="page-title">정보 제공</h2>
            <div className="dashboard-card info-card">
              <h3 className="section-title">공지사항 및 새소식</h3>
              <div className="notice-list">
                {noticeData.map((notice, i) => (
                  <div key={i} className="notice-item">
                    <div className="notice-left">
                      <span className={`notice-tag ${notice.type === '공지사항' ? 'tag-blue' : 'tag-gray'}`}>{notice.type}</span>
                      <span className="notice-date">{notice.date}</span>
                      <span className="notice-title">{notice.title}</span>
                    </div>
                    <div className="notice-right"><ChevronRight /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="dashboard-card info-card">
              <h3 className="section-title">자격증 학습 팁</h3>
              <div className="study-tips-list">
                {studyTips.map((tip, i) => (
                  <div key={i} className="tip-card">
                    <div className="tip-icon-box">{tip.icon}</div>
                    <div className="tip-content"><h4>{tip.title}</h4><p>{tip.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'search' && (
          <div className="tab-search">
            <h2 className="page-title">자격증 탐색</h2>
            <div className="dashboard-card search-filter-card">
              <div className="filter-header"><FilterIcon /> <h3>필터</h3></div>
              <div className="filter-row">
                <span className="filter-label">난이도</span>
                <div className="filter-buttons">
                  {['전체', '초급', '중급', '고급'].map(f => (
                    <button key={f} className={`filter-btn ${filterDifficulty === f ? 'active' : ''}`} onClick={() => setFilterDifficulty(f)}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="filter-row">
                <span className="filter-label">분야</span>
                <div className="filter-buttons">
                  {['전체', 'IT/개발', '데이터 분석', '네트워크', '보안', '디자인'].map(f => (
                    <button key={f} className={`filter-btn ${filterField === f ? 'active' : ''}`} onClick={() => setFilterField(f)}>{f}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="search-content-grid">
              <div className="recommended-section">
                <h3 className="section-title-sm">추천 자격증</h3>
                <div className="cert-grid-2col">
                  {recommendedCerts.map((cert, i) => (
                    <div key={i} className="dashboard-card cert-item-card">
                      <div className="cert-card-header">
                        <h4>{cert.title}</h4>
                        <div className="cert-tags">{cert.tags.map((t, idx) => <span key={idx} className="cert-mini-tag">{t}</span>)}</div>
                      </div>
                      <div className="cert-stats">
                        <div className="stat-row"><span>인기도</span><span>{cert.popularity}%</span></div>
                        <div className="stat-bar-bg"><div className="stat-bar-fill" style={{width: `${cert.popularity}%`}}></div></div>
                        <div className="stat-row bottom"><span className="stat-label">준비기간</span><span className="stat-val">{cert.duration}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ranking-section">
                <div className="dashboard-card ranking-card">
                  <h3 className="section-title-sm">인기 자격증 순위</h3>
                  <div className="ranking-list">
                    {certRankings.map((item, i) => (
                      <div key={i} className="ranking-item">
                        <div className="rank-left"><span className="rank-circle">{item.rank}</span><span className="rank-name">{item.name}</span></div>
                        <span className="rank-growth">{item.growth} ↑</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'mypage' && (
          <div className="tab-mypage">
            <div className="profile-card">
              <div className="profile-content-wrapper">
                <div className="profile-avatar-section">
                  <div className="avatar-circle"><UserIcon /></div>
                  <div className="profile-name-text">{userInfo.name}</div>
                </div>
                <div className="profile-info-grid">
                  <div className="info-item"><span className="info-title">아이디</span><span className="info-data">{userInfo.id}</span></div>
                  <div className="info-item"><span className="info-title">이메일</span><span className="info-data">{userInfo.email}</span></div>
                  <div className="info-item"><span className="info-title">가입일</span><span className="info-data">{userInfo.joinedDate}</span></div>
                </div>
              </div>
              <button className="edit-profile-btn">프로필 수정</button>
            </div>
            <div className="activity-grid">
              {myActivityStats.map((stat, i) => (
                <div key={i} className="activity-card">
                  <div className="act-header">{stat.icon} <span>{stat.label}</span></div>
                  <div className="act-main-val">{stat.value}</div>
                  <div className="act-sub-val">{stat.sub}</div>
                </div>
              ))}
            </div>
            <div className="settings-section-card">
              <div className="settings-list">
                {mySettings.map((item, i) => (
                  <div key={i} className="setting-item" onClick={item.action || undefined} style={item.action ? {cursor: 'pointer'} : {}}>
                    <div className="setting-left"><span className="setting-icon">{item.icon}</span><span>{item.label}</span></div>
                    <ChevronRight />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
