import { useState } from 'react';
import { FiAward, FiBook, FiBriefcase, FiShoppingBag } from 'react-icons/fi';
import '../styles/signup.css';

function ProfileSetup() {
  const [form, setForm] = useState({
    job: '',
    grade: '',
    major: '',
    interest: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'job') {
      setForm(prev => ({ ...prev, [name]: value, grade: '', major: '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="profile-header" style={{ textAlign: 'center', marginBottom: '30px', marginTop: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <img src="/SPLogo.png" alt="SkillPilot Logo" style={{ width: '40px' }} />
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: 0 }}>SkillPilot</h1>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginTop: '20px', color: '#334155' }}>프로필 설정</h2>
      </div>

      <form className="signup-form">
        {/* 직업 선택 */}
        <div className="input-group">
          <div className="label-with-icon">
            <FiShoppingBag className="label-icon" />
            <label>직업</label>
          </div>
          <select name="job" value={form.job} onChange={handleChange} required>
            <option value="" disabled hidden>직업 선택</option>
            <option value="고등학생">고등학생</option>
            <option value="대학생">대학생</option>
            <option value="취업준비생">취업준비생</option>
            <option value="직장인">직장인</option>
          </select>
        </div>

        {/* 학년: 고등학생(1-3), 대학생(1-4) */}
        {(form.job === "고등학생" || form.job === "대학생") && (
          <div className="input-group">
            <div className="label-with-icon">
              <FiAward className="label-icon" />
              <label>학년</label>
            </div>
            <select name="grade" value={form.grade} onChange={handleChange} required>
              <option value="" disabled hidden>학년 선택</option>
              <option value="1학년">1학년</option>
              <option value="2학년">2학년</option>
              <option value="3학년">3학년</option>
              {form.job === "대학생" && <option value="4학년">4학년</option>}
            </select>
          </div>
        )}

        {/* 전공: 대학생일 때만 */}
        {form.job === "대학생" && (
          <div className="input-group">
            <div className="label-with-icon">
              <FiBook className="label-icon" />
              <label>전공</label>
            </div>
            <input name="major" placeholder="전공을 입력하세요" onChange={handleChange} />
          </div>
        )}

        {/* 직무 분야 */}
        <div className="input-group">
          <div className="label-with-icon">
            <FiBriefcase className="label-icon" />
            <label>직무 관심 분야</label>
          </div>
          <input name="interest" placeholder="예: 백엔드 개발" onChange={handleChange} />
        </div>

        <button type="submit" className="signup-button" style={{ backgroundColor: '#2d3e5d', marginTop: '30px' }}>
          설정 완료
        </button>
      </form>
    </div>
  );
}

export default ProfileSetup;