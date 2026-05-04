import React, { useState, useEffect, useCallback } from 'react';
import '../styles/dashboard.css';
import CBT from './CBT';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { Modal, Button, EmptyState, Input } from '../components/ui';
import { CheerBanner } from '../components/assistant';
import { StatRow, ProgressDonut, StudyHeatmap, StudyTrendChart } from '../components/dashboard';

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
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    year: '', month: '', day: '',
    goal: '', amount: '', schedule: '', status: 'incomplete'
  });
  const [filterDifficulty, setFilterDifficulty] = useState('전체');
  const [filterField, setFilterField] = useState('전체');
  const [dashboardData, setDashboardData] = useState(null);

  // Schedule state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [schedules, setSchedules] = useState([]);

  // Certification state
  const [allCerts, setAllCerts] = useState([]);
  const [certRankings, setCertRankings] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ levels: [], fields: [] });

  // Roadmap state
  const [roadmapData, setRoadmapData] = useState(null);

  // Notices + tips (API)
  const [notices, setNotices] = useState([]);
  const [tips, setTips] = useState([]);

  // Learning record modal
  const [isLearningModalOpen, setIsLearningModalOpen] = useState(false);
  const [learningForm, setLearningForm] = useState({
    date: new Date().toISOString().split('T')[0],
    studyHours: '',
    topics: '',
    notes: '',
  });
  const [learningSummary, setLearningSummary] = useState(null);

  // User certs from dashboard
  const userCerts = dashboardData?.userCerts || [];
  const mainCert = userCerts[0]?.certification || null;

  // Fetch dashboard data on mount and when returning to dashboard tab
  const fetchDashboard = useCallback(() => {
    api.get('/dashboard')
      .then(res => setDashboardData(res.data.data))
      .catch(() => {});
    api.get('/roadmap')
      .then(res => {
        const roadmaps = res.data.data || [];
        if (roadmaps.length > 0) setRoadmapData(roadmaps[0]);
        else setRoadmapData(null);
      })
      .catch(() => {});
    api.get('/learning-records/summary')
      .then(res => setLearningSummary(res.data.data))
      .catch(() => setLearningSummary(null));
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Fetch schedules when year/month changes
  const fetchSchedules = useCallback(() => {
    api.get('/schedules', { params: { year: currentYear, month: currentMonth } })
      .then(res => setSchedules(res.data.data || []))
      .catch(() => setSchedules([]));
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Fetch certifications when search tab is active
  useEffect(() => {
    if (currentTab === 'search') {
      api.get('/certifications')
        .then(res => setAllCerts(res.data.data || []))
        .catch(() => setAllCerts([]));
      api.get('/certifications/rankings')
        .then(res => setCertRankings(res.data.data || []))
        .catch(() => setCertRankings([]));
      api.get('/certifications/filter-options')
        .then(res => setFilterOptions(res.data.data || { levels: [], fields: [] }))
        .catch(() => setFilterOptions({ levels: [], fields: [] }));
    }
  }, [currentTab]);

  // Fetch notices + tips when info tab is active
  useEffect(() => {
    if (currentTab === 'info') {
      api.get('/notices', { params: { type: '공지사항', limit: 10 } })
        .then(res => setNotices(res.data.data || []))
        .catch(() => setNotices([]));
      api.get('/notices', { params: { type: '학습 팁', limit: 10 } })
        .then(res => setTips(res.data.data || []))
        .catch(() => setTips([]));
    }
  }, [currentTab]);

  // Refresh data when switching back to dashboard tab
  useEffect(() => {
    if (currentTab === 'dashboard') {
      fetchDashboard();
    }
  }, [currentTab, fetchDashboard]);

  // Build calendarDays dynamically from schedules
  const buildCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', type: 'empty' });
    }
    // Each day of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const schedule = schedules.find(s => s.date === dateStr);
      if (schedule) {
        const type = schedule.status === '완료' ? 'done' : schedule.status === '예정' ? 'scheduled' : 'default';
        days.push({
          day: d,
          type,
          statusLabel: schedule.status,
          goal: schedule.goal,
          amount: schedule.amount,
          scheduleId: schedule.id,
        });
      } else {
        days.push({ day: d, type: 'default' });
      }
    }
    return days;
  };

  const calendarDays = buildCalendarDays();

  // Build scheduleListData from fetched schedules that have goals
  const scheduleListData = schedules
    .filter(s => s.goal)
    .map(s => {
      const dateObj = new Date(s.date);
      const day = dateObj.getDate();
      return {
        id: s.id,
        date: `${day}일`,
        fullDate: `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월`,
        title: s.goal,
        sub1: `학습 분량: ${s.amount || '-'}`,
        sub2: `예정: ${s.event || '-'}`,
        status: s.status === '완료' ? 'done' : 'scheduled',
        rawDate: s.date,
      };
    });

  // Filter certifications client-side
  const filteredCerts = allCerts.filter(cert => {
    if (filterDifficulty !== '전체' && cert.level !== filterDifficulty) return false;
    if (filterField !== '전체' && cert.field !== filterField) return false;
    return true;
  });

  // Roadmap weeks for dashboard card
  const roadmapWeeks = roadmapData?.weeks || [];

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

  // 공지/팁 은 currentTab === 'info' 진입 시 /api/notices 에서 가져옵니다.
  const formatNoticeDate = (n) => {
    const d = n.published_at || n.createdAt;
    if (!d) return '';
    return new Date(d).toISOString().split('T')[0];
  };

  const userName = user?.name || '사용자';
  const userInfo = {
    name: userName,
    id: user?.email?.split('@')[0] || 'user',
    email: user?.email || '',
    joinedDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : ''
  };

  const monthHours = learningSummary?.monthHours ?? dashboardData?.monthlyStudyHours ?? 0;
  const weekHours  = learningSummary?.weekHours  ?? 0;
  const streak     = learningSummary?.streak     ?? 0;
  const dailySeries = learningSummary?.daily      ?? [];

  const myActivityStats = [
    { label: '총 학습 시간', value: `${monthHours}시간`, sub: '이번 달 기준', icon: <ClockIcon /> },
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
    const parts = item.rawDate ? item.rawDate.split('-') : [];
    setEditingId(item.id || null);
    setEditFormData({
      year: parts[0] || String(currentYear),
      month: parts[1] || String(currentMonth),
      day: parts[2] ? String(parseInt(parts[2])) : item.date.replace('일', ''),
      goal: item.title,
      amount: (item.sub1 || '').replace('학습 분량: ', ''),
      schedule: (item.sub2 || '').replace('예정: ', ''),
      status: item.status === 'done' ? 'complete' : 'incomplete'
    });
    setIsEditModalOpen(true);
  };
  const handleEditClose = () => { setIsEditModalOpen(false); setEditingId(null); };

  const handleEditSave = async () => {
    const dateStr = `${editFormData.year}-${String(editFormData.month).padStart(2, '0')}-${String(editFormData.day).padStart(2, '0')}`;
    const payload = {
      date: dateStr,
      goal: editFormData.goal,
      amount: editFormData.amount,
      event: editFormData.schedule,
      status: editFormData.status === 'complete' ? '완료' : '예정',
    };
    try {
      if (editingId) {
        await api.put('/schedules/' + editingId, payload);
      } else {
        await api.post('/schedules', payload);
      }
      fetchSchedules();
      setIsEditModalOpen(false);
      setEditingId(null);
    } catch (err) {
      alert('일정 저장에 실패했습니다.');
    }
  };

  const handleAddSchedule = () => {
    setEditingId(null);
    setEditFormData({
      year: String(currentYear),
      month: String(currentMonth),
      day: '',
      goal: '', amount: '', schedule: '', status: 'incomplete'
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('이 일정을 삭제하시겠습니까?')) return;
    try {
      await api.delete('/schedules/' + id);
      fetchSchedules();
    } catch (err) {
      alert('일정 삭제에 실패했습니다.');
    }
  };

  const handleFormChange = (e) => { const { name, value } = e.target; setEditFormData(prev => ({ ...prev, [name]: value })); };

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(currentYear - 1); }
    else { setCurrentMonth(currentMonth - 1); }
  };
  const handleNextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(currentYear + 1); }
    else { setCurrentMonth(currentMonth + 1); }
  };

  // Cert card display
  const certTitle = mainCert?.title || '자격증 미선택';
  const certDuration = mainCert?.duration || '-';
  const certJobs = mainCert?.jobs ? mainCert.jobs.split(',').map(j => j.trim()) : [];
  const certExamInfo = mainCert?.exam_info || '';
  const certTips = mainCert?.tips ? mainCert.tips.split('\n').filter(Boolean) : [];

  // Roadmap progress — count weeks explicitly marked completed
  const completedWeekCount = roadmapWeeks.filter((w) => w.completed === true).length;
  const roadmapProgress = roadmapWeeks.length > 0
    ? Math.round((completedWeekCount / roadmapWeeks.length) * 100)
    : 0;

  // 헤로 통계 카드 4종 — 모두 동일한 navy 톤
  const heroStats = [
    {
      value: `${streak}일`,
      label: '연속 학습',
      sub: streak > 0 ? '오늘도 이어가요!' : '오늘부터 시작!',
    },
    {
      value: `${weekHours}h`,
      label: '이번 주 학습',
      sub: '최근 7일 기준',
    },
    {
      value: `${roadmapWeeks.length > 0 ? roadmapProgress : 0}%`,
      label: '로드맵 진행',
      sub: roadmapWeeks.length > 0 ? `${completedWeekCount}/${roadmapWeeks.length}주차` : '로드맵을 만들어요',
    },
    {
      value: `${dashboardData?.certCount ?? 0}개`,
      label: '도전 자격증',
      sub: certTitle !== '자격증 미선택' ? certTitle : '자격증을 선택해요',
    },
  ];

  // 학습 기록 저장
  const saveLearningRecord = async () => {
    try {
      await api.post('/learning-records', {
        date: learningForm.date,
        studyHours: Number(learningForm.studyHours) || 0,
        topics: learningForm.topics.split(',').map((s) => s.trim()).filter(Boolean),
        notes: learningForm.notes,
      });
      setIsLearningModalOpen(false);
      setLearningForm({
        date: new Date().toISOString().split('T')[0],
        studyHours: '',
        topics: '',
        notes: '',
      });
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || '학습 기록 저장에 실패했습니다.');
    }
  };

  if (currentTab === 'cbt') {
    return (
      <CBT
        onExit={() => handlePageChange('dashboard')}
        certId={userCerts[0]?.certification_id}
        certTitle={mainCert?.title || '자격증'}
      />
    );
  }

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <button
          type="button"
          className="brand"
          onClick={() => handlePageChange('dashboard')}
          style={{ cursor: 'pointer', background: 'transparent', border: 'none', padding: 0 }}
          aria-label="대시보드 홈으로 이동"
        >
          <img src="/SPLogo.png" alt="" onError={(e) => e.target.style.display='none'} />
          <span>SkillPilot 대시보드</span>
        </button>
        <button
          type="button"
          className="menu-btn"
          onClick={toggleSidebar}
          aria-label="메뉴 열기"
          aria-expanded={isSidebarOpen}
          aria-controls="sp-sidebar"
        >
          ☰
        </button>
      </header>

      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>
      <aside
        id="sp-sidebar"
        className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}
        aria-label="주 메뉴"
        aria-hidden={!isSidebarOpen}
      >
        <div className="sidebar-header">
          <h2>메뉴</h2>
          <button type="button" className="close-btn" onClick={toggleSidebar} aria-label="메뉴 닫기">
            <CloseIcon />
          </button>
        </div>
        <nav className="sidebar-menu" aria-label="페이지 이동">
          <button type="button" className={`sidebar-item ${currentTab === 'dashboard' ? 'active' : ''}`} aria-current={currentTab === 'dashboard' ? 'page' : undefined} onClick={() => handlePageChange('dashboard')}><HomeIcon /> 대시보드</button>
          <button type="button" className={`sidebar-item ${currentTab === 'schedule' ? 'active' : ''}`} aria-current={currentTab === 'schedule' ? 'page' : undefined} onClick={() => handlePageChange('schedule')}><CalendarIcon /> 일정 관리</button>
          <button type="button" className={`sidebar-item ${currentTab === 'info' ? 'active' : ''}`} aria-current={currentTab === 'info' ? 'page' : undefined} onClick={() => handlePageChange('info')}><DocIcon /> 정보 제공</button>
          <button type="button" className={`sidebar-item ${currentTab === 'search' ? 'active' : ''}`} aria-current={currentTab === 'search' ? 'page' : undefined} onClick={() => handlePageChange('search')}><SearchIcon /> 자격증 탐색</button>
          <button type="button" className="sidebar-item" onClick={() => navigate('/mock-interview')}><TrophyIcon /> AI 모의면접</button>
          <button type="button" className="sidebar-item" onClick={() => navigate('/job-matching')}><SearchIcon /> 채용 매칭</button>
          <button type="button" className={`sidebar-item ${currentTab === 'mypage' ? 'active' : ''}`} aria-current={currentTab === 'mypage' ? 'page' : undefined} onClick={() => handlePageChange('mypage')}><UserIcon /> 마이페이지</button>
        </nav>
      </aside>

      <Modal
        open={isCertModalOpen}
        onClose={toggleCertModal}
        title={certTitle}
        size="md"
      >
        <div className="modal-body-content">
          <div className="info-group"><p className="info-label">자격증명</p><p className="info-value">{certTitle}</p></div>
          <div className="info-group"><p className="info-label">난이도</p><p className="info-value">{mainCert?.level || '-'}</p></div>
          <div className="info-group"><p className="info-label">준비기간</p><p className="info-value">{certDuration}</p></div>
          <div className="info-group">
            <p className="info-label">관련 직무</p>
            <div className="job-tags">{certJobs.length > 0 ? certJobs.map((j, i) => <span key={i} className="job-tag">{j}</span>) : <span className="info-value">-</span>}</div>
          </div>
          {certExamInfo && <div className="info-group"><p className="info-label">시험 정보</p><p className="info-value">{certExamInfo}</p></div>}
          {certTips.length > 0 && (
            <div className="info-group">
              <p className="info-label">준비 팁</p>
              <ul className="tip-list">{certTips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={isLearningModalOpen}
        onClose={() => setIsLearningModalOpen(false)}
        title="학습 기록 추가"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsLearningModalOpen(false)}>취소</Button>
            <Button variant="primary" onClick={saveLearningRecord}>저장</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="학습 날짜"
            type="date"
            value={learningForm.date}
            onChange={(e) => setLearningForm({ ...learningForm, date: e.target.value })}
          />
          <Input
            label="학습 시간 (시간)"
            type="number"
            step="0.5"
            min="0"
            value={learningForm.studyHours}
            onChange={(e) => setLearningForm({ ...learningForm, studyHours: e.target.value })}
          />
          <Input
            label="학습 주제 (쉼표로 구분)"
            type="text"
            placeholder="예) SQL 기초, 정규화"
            value={learningForm.topics}
            onChange={(e) => setLearningForm({ ...learningForm, topics: e.target.value })}
          />
          <Input
            label="메모"
            type="text"
            value={learningForm.notes}
            onChange={(e) => setLearningForm({ ...learningForm, notes: e.target.value })}
          />
        </div>
      </Modal>

      <Modal
        open={isEditModalOpen}
        onClose={handleEditClose}
        title={editingId ? '일정 수정' : '일정 추가'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={handleEditClose}>취소</Button>
            <Button variant="primary" onClick={handleEditSave}>저장</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-date-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Input label="년도" name="year" value={editFormData.year} onChange={handleFormChange} />
            <Input label="월"   name="month" value={editFormData.month} onChange={handleFormChange} />
            <Input label="일"   name="day" value={editFormData.day} onChange={handleFormChange} />
          </div>
          <Input label="학습 목표"   name="goal"     value={editFormData.goal}     onChange={handleFormChange} />
          <Input label="학습 분량"   name="amount"   value={editFormData.amount}   onChange={handleFormChange} />
          <Input label="예정된 시험/강의" name="schedule" value={editFormData.schedule} onChange={handleFormChange} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', margin: '0 0 8px' }}>완료 여부</p>
            <div className="status-toggle-group">
              <button
                type="button"
                className={`status-btn ${editFormData.status === 'incomplete' ? 'active-incomplete' : ''}`}
                aria-pressed={editFormData.status === 'incomplete'}
                onClick={() => setEditFormData({ ...editFormData, status: 'incomplete' })}
              >
                미완료
              </button>
              <button
                type="button"
                className={`status-btn ${editFormData.status === 'complete' ? 'active-complete' : ''}`}
                aria-pressed={editFormData.status === 'complete'}
                onClick={() => setEditFormData({ ...editFormData, status: 'complete' })}
              >
                완료
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <main className="dashboard-main-content">
        {currentTab === 'dashboard' && (
          <div className="tab-dashboard">
            <section className="dashboard-card welcome-card">
              <div className="welcome-text"><h2>안녕하세요, {userName}님! 👋</h2><p>오늘도 목표를 향해 한 걸음 나아가볼까요?</p></div>
              <button className="dark-btn" onClick={() => navigate("/portfolio")}>내 포트폴리오로 이동</button>
            </section>

            <StatRow stats={heroStats} />

            <CheerBanner intervalMs={7000} />


            <section className="dashboard-card cert-card">
              <div className="card-left"><div className="icon-box blue-bg"><DiplomaIcon /></div><div><h3>{certTitle}{mainCert ? '' : ''}</h3><p className="sub-text">{certExamInfo || (mainCert ? `준비기간: ${certDuration}` : '자격증을 선택해주세요')}</p></div></div>
              <button className="light-btn" onClick={toggleCertModal}>상세보기</button>
            </section>

            <div className="dashboard-grid">
              <div className="dashboard-card roadmap-card">
                <div className="card-header"><TargetIcon /><h3>학습 로드맵</h3></div>
                <div className="roadmap-list">
                  {roadmapWeeks.length > 0 ? roadmapWeeks.slice(0, 4).map((week, i) => {
                    const isCompleted = i < Math.floor(roadmapWeeks.length * roadmapProgress / 100);
                    const isActive = i === Math.floor(roadmapWeeks.length * roadmapProgress / 100);
                    return (
                      <div key={week.weekId || i} className={`roadmap-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                        <span className={`check-icon ${isCompleted ? '' : isActive ? 'active-check' : 'empty'}`}>{isCompleted || isActive ? '✔' : ''}</span>
                        <span>{week.title}</span>
                        {isActive && <span className="status-badge">진행중</span>}
                      </div>
                    );
                  }) : (
                    <>
                      <div className="roadmap-item"><span className="check-icon empty"></span><span>로드맵을 생성해주세요</span></div>
                    </>
                  )}
                </div>
                <div className="progress-section progress-section--donut">
                  <ProgressDonut
                    value={roadmapWeeks.length > 0 ? roadmapProgress : 0}
                    size={140}
                    stroke={12}
                    label="전체 진행률"
                  />
                  <div className="progress-section__hint">
                    {roadmapWeeks.length > 0
                      ? `${completedWeekCount} / ${roadmapWeeks.length}주차 완료`
                      : '로드맵을 만들어주세요'}
                  </div>
                </div>
                <div className="other-certs">
                  <p>다른 자격증 검색</p>
                  <div className="tags">
                    {userCerts.slice(1, 3).map((uc, i) => (
                      <span key={i} className="tag">{uc.certification?.title || '자격증'} ⓘ</span>
                    ))}
                    {userCerts.length <= 1 && <span className="tag" onClick={() => handlePageChange('search')} style={{cursor:'pointer'}}>자격증 탐색하기 →</span>}
                  </div>
                </div>
              </div>

              <div className="dashboard-card calendar-card">
                <div className="card-header"><CalendarIcon /><h3>학습 캘린더</h3></div>
                <div className="calendar-content">
                  <h4 className="month-title">{currentYear}년 {currentMonth}월</h4>
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
              <div className="card-left"><div className="icon-box blue-bg"><GradCapIcon /></div><div><h3>CBT 모의고사</h3><p className="sub-text">{mainCert?.title ? `${mainCert.title} 모의고사로 실력을 점검하세요` : '자격증을 먼저 선택해주세요'}</p></div></div>
              <button className="dark-btn" disabled={!mainCert} onClick={() => handlePageChange('cbt')}>CBT 모의고사 시작</button>
            </section>

            <div className="dashboard-grid">
              <section className="dashboard-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/mock-interview')}>
                <div className="card-header"><TrophyIcon /><h3>AI 모의면접</h3></div>
                <p className="sub-text">선택한 직무에 맞춘 기술 면접을 연습하세요</p>
                <button className="dark-btn" style={{ marginTop: 12 }}>면접 시작</button>
              </section>
              <section className="dashboard-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/job-matching')}>
                <div className="card-header"><SearchIcon /><h3>채용 매칭</h3></div>
                <p className="sub-text">내 역량과 자격증을 기준으로 매칭된 공고를 확인하세요</p>
                <button className="dark-btn" style={{ marginTop: 12 }}>매칭 보기</button>
              </section>
            </div>

            <section className="dashboard-card learning-card">
              <div className="learning-card__head">
                <div className="card-header" style={{ marginBottom: 0 }}>
                  <ClockIcon />
                  <h3>학습 기록</h3>
                </div>
                <button className="dark-btn" onClick={() => setIsLearningModalOpen(true)}>
                  오늘 학습 기록 추가
                </button>
              </div>
              <p className="sub-text" style={{ marginBottom: 16 }}>
                이번 주 {weekHours}시간 · 이번 달 {monthHours}시간 · 연속 {streak}일
              </p>
              <StudyTrendChart daily={dailySeries} days={14} />
              <div style={{ marginTop: 24 }}>
                <StudyHeatmap daily={dailySeries} weeks={12} />
              </div>
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
                  <div className="calendar-header-center">
                    <button className="light-btn" onClick={handlePrevMonth} style={{marginRight: '8px', padding: '4px 12px'}}>◀</button>
                    <CalendarIcon /> <h3>{currentYear}년 {currentMonth}월</h3>
                    <button className="light-btn" onClick={handleNextMonth} style={{marginLeft: '8px', padding: '4px 12px'}}>▶</button>
                  </div>
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
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                    <h3 className="list-view-title" style={{margin: 0}}>전체 일정</h3>
                    <button className="dark-btn" onClick={handleAddSchedule} style={{padding: '8px 16px', fontSize: '14px'}}>일정 추가</button>
                  </div>
                  <div className="schedule-list-container">
                    {scheduleListData.length === 0 && (
                      <EmptyState
                        icon="📅"
                        title="등록된 일정이 없습니다"
                        description="‘일정 추가’ 버튼을 눌러 첫 학습 일정을 등록해 보세요."
                      />
                    )}
                    {scheduleListData.map((item, index) => (
                      <div className="schedule-list-item clickable" key={index} onClick={() => handleEditClick(item)}>
                        <div className="list-date-box"><span className="small-year">{item.fullDate}</span><span className="big-date">{item.date}</span></div>
                        <div className="list-info-box">
                          <h4 className="list-title">{item.title}</h4>
                          <p className="list-desc">{item.sub1}</p>
                          <p className="list-desc">{item.sub2}</p>
                        </div>
                        <div className="list-status-box" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          {item.status === 'done' ? <span className="status-pill done"><CheckIcon /> 완료</span> : <span className="status-pill scheduled">예정</span>}
                          <button className="light-btn" style={{padding: '4px 10px', fontSize: '12px', color: '#e74c3c', borderColor: '#e74c3c'}} onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(item.id); }}>삭제</button>
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
                {notices.length === 0 && (
                  <EmptyState icon="📢" title="등록된 공지가 없습니다" />
                )}
                {notices.map((notice) => (
                  <div key={notice.id} className="notice-item">
                    <div className="notice-left">
                      <span className="notice-tag tag-blue">{notice.type}</span>
                      <span className="notice-date">{formatNoticeDate(notice)}</span>
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
                {tips.length === 0 && (
                  <EmptyState icon="💡" title="등록된 학습 팁이 없습니다" />
                )}
                {tips.map((tip) => (
                  <div key={tip.id} className="tip-card">
                    <div className="tip-icon-box">{tip.icon || '💡'}</div>
                    <div className="tip-content">
                      <h4>{tip.title}</h4>
                      <p>{tip.content}</p>
                    </div>
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
                <span className="filter-label">자격구분</span>
                <div className="filter-buttons">
                  {['전체', ...filterOptions.levels].map(f => (
                    <button key={f} className={`filter-btn ${filterDifficulty === f ? 'active' : ''}`} onClick={() => setFilterDifficulty(f)}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="filter-row">
                <span className="filter-label">분야</span>
                <div className="filter-buttons">
                  {['전체', ...filterOptions.fields].map(f => (
                    <button key={f} className={`filter-btn ${filterField === f ? 'active' : ''}`} onClick={() => setFilterField(f)}>{f}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="search-content-grid">
              <div className="recommended-section">
                <h3 className="section-title-sm">추천 자격증</h3>
                <div className="cert-grid-2col">
                  {filteredCerts.length === 0 && (
                    <EmptyState
                      icon="🔍"
                      title="조건에 맞는 자격증이 없습니다"
                      description="필터를 다시 조정해 보세요."
                    />
                  )}
                  {filteredCerts.map((cert, i) => (
                    <div key={cert.id || i} className="dashboard-card cert-item-card">
                      <div className="cert-card-header">
                        <h4>{cert.title}</h4>
                        <div className="cert-tags">
                          <span className="cert-mini-tag">{cert.level}</span>
                          {cert.field && <span className="cert-mini-tag">{cert.field}</span>}
                        </div>
                      </div>
                      <div className="cert-stats">
                        <div className="stat-row"><span>인기도</span><span>{cert.popularity || 0}%</span></div>
                        <div className="stat-bar-bg"><div className="stat-bar-fill" style={{width: `${cert.popularity || 0}%`}}></div></div>
                        <div className="stat-row bottom"><span className="stat-label">준비기간</span><span className="stat-val">{cert.duration || '-'}</span></div>
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
                        <div className="rank-left"><span className="rank-circle">{item.rank || i + 1}</span><span className="rank-name">{item.title || item.name}</span></div>
                        <span className="rank-growth">{item.growth || `${item.popularity || 0}%`} ↑</span>
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
