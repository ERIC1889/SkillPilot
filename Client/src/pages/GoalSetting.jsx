import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMonitor, FiServer, FiCode, FiSmartphone, FiDatabase, FiBarChart2, FiLayers, FiMoreHorizontal, FiChevronLeft } from 'react-icons/fi';
import api from '../services/api';
import '../styles/signup.css';

function GoalSetting() {
  const navigate = useNavigate();
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [period, setPeriod] = useState(1);
  const [etcRole, setEtcRole] = useState('');
  const [techStack, setTechStack] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'fe', name: '프론트엔드 개발자', icon: <FiMonitor /> }, { id: 'be', name: '백엔드 개발자', icon: <FiServer /> },
    { id: 'fs', name: '풀스택 개발자', icon: <FiCode /> }, { id: 'ios', name: 'iOS 개발자', icon: <FiSmartphone /> },
    { id: 'and', name: 'Android 개발자', icon: <FiSmartphone /> }, { id: 'de', name: '데이터 엔지니어', icon: <FiDatabase /> },
    { id: 'da', name: '데이터 분석가', icon: <FiBarChart2 /> }, { id: 'uiux', name: 'UI/UX 디자이너', icon: <FiLayers /> },
    { id: 'etc', name: '기타', icon: <FiMoreHorizontal /> },
  ];

  const toggleRole = (name) => {
    setSelectedRoles(prev =>
      prev.includes(name) ? prev.filter(r => r !== name) : [...prev, name]
    );
  };

  const handleComplete = async () => {
    const finalRoles = selectedRoles.map(r => r === '기타' ? etcRole : r).filter(Boolean);
    setError('');
    setLoading(true);
    try {
      await api.post('/goals', {
        tech_stack: techStack || null,
        target_roles: finalRoles,
        custom_role: etcRole || null,
        period: `${period}개월`,
      });
      navigate('/CertificationRecommendation');
    } catch (err) {
      setError(err.response?.data?.message || '목표 설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="profile-header-section">
        <button type="button" className="back-button" onClick={() => navigate(-1)}><FiChevronLeft /></button>
        <div className="logo-group"><img src="/SPLogo.png" alt="Logo" className="header-logo" /><h1 className="header-brand">SkillPilot</h1></div>
        <h2 className="header-title" style={{ width: '100%', justifyContent: 'center' }}>프로필 설정</h2>
      </div>

      {error && <div style={{ color: '#dc2626', fontSize: '14px', textAlign: 'center', marginBottom: '12px' }}>{error}</div>}

      <div className="goal-card">
        <h3 className="card-subtitle">목표 설정</h3>

        <div className="goal-group">
          <label className="goal-label">기술스택</label>
          <input className="goal-input" placeholder="기술스택을 입력하세요" value={techStack} onChange={(e) => setTechStack(e.target.value)} />
        </div>

        <div className="goal-group">
          <label className="goal-label">희망직무</label>
          <div className="role-grid">
            {roles.map(r => (
              <div key={r.id} className={`role-item ${selectedRoles.includes(r.name) ? 'active' : ''}`} onClick={() => toggleRole(r.name)}>
                <span className="role-icon">{r.icon}</span>
                <span className="role-name">{r.name}</span>
              </div>
            ))}
          </div>

          {selectedRoles.includes('기타') && (
            <div className="etc-input-container" style={{ marginTop: '10px', width: '100%', boxSizing: 'border-box' }}>
              <input
                className="goal-input"
                placeholder="직무를 직접 입력하세요"
                value={etcRole}
                onChange={(e) => setEtcRole(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="goal-group">
          <label className="goal-label">준비기간</label>
          <input type="range" min="1" max="12" value={period} className="period-slider" onChange={(e) => setPeriod(e.target.value)} />
          <div className="period-value">{period}개월</div>
        </div>

        <button className="complete-button" disabled={loading} onClick={handleComplete}>
          {loading ? '저장 중...' : '완료하기'}
        </button>
      </div>
    </div>
  );
}

export default GoalSetting;
