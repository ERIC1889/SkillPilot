import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMonitor, FiServer, FiCode, FiSmartphone, FiDatabase, FiBarChart2, FiLayers, FiMoreHorizontal, FiChevronLeft } from 'react-icons/fi';
import '../styles/signup.css'; 

function GoalSetting() {
  const navigate = useNavigate();
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [period, setPeriod] = useState(1);
  const roles = [
    { id: 'fe', name: '프론트엔드 개발자', icon: <FiMonitor /> }, { id: 'be', name: '백엔드 개발자', icon: <FiServer /> },
    { id: 'fs', name: '풀스택 개발자', icon: <FiCode /> }, { id: 'ios', name: 'iOS 개발자', icon: <FiSmartphone /> },
    { id: 'and', name: 'Android 개발자', icon: <FiSmartphone /> }, { id: 'de', name: '데이터 엔지니어', icon: <FiDatabase /> },
    { id: 'da', name: '데이터 분석가', icon: <FiBarChart2 /> }, { id: 'uiux', name: 'UI/UX 디자이너', icon: <FiLayers /> },
    { id: 'etc', name: '기타', icon: <FiMoreHorizontal /> },
  ];

  const toggleRole = (name) => setSelectedRoles(prev => prev.includes(name) ? prev.filter(r => r !== name) : [...prev, name]);

  return (
    <div className="signup-wrapper">
      <div className="profile-header-section">
        <button type="button" className="back-button" onClick={() => navigate(-1)}><FiChevronLeft /></button>
        <div className="logo-group"><img src="/SPLogo.png" alt="Logo" className="header-logo" /><h1 className="header-brand">SkillPilot</h1></div>
        <h2 className="header-title">프로필 설정</h2>
      </div>
      <div className="goal-card">
        <h3 className="card-subtitle">목표 설정</h3>
        <div className="goal-group"><label className="goal-label">기술스택</label><input className="goal-input" placeholder="기술스택을 입력하세요" /></div>
        <div className="goal-group">
          <label className="goal-label">희망직무</label>
          <div className="role-grid">
            {roles.map(r => (
              <div key={r.id} className={`role-item ${selectedRoles.includes(r.name) ? 'active' : ''}`} onClick={() => toggleRole(r.name)}>
                <span className="role-icon">{r.icon}</span><span className="role-name">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="goal-group">
          <label className="goal-label">준비기간</label>
          <input type="range" min="1" max="12" value={period} className="period-slider" onChange={(e) => setPeriod(e.target.value)} />
          <div className="period-value">{period}개월</div>
        </div>
        <button className="complete-button" onClick={() => { alert('설정 완료!'); navigate('/'); }}>완료하기</button>
      </div>
    </div>
  );
}
export default GoalSetting;