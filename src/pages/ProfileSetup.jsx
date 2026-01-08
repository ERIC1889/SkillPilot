import { useState } from 'react';
// 1. useNavigate 추가 확인
import { useNavigate } from 'react-router-dom'; 
import { FiAward, FiBook, FiBriefcase, FiShoppingBag, FiChevronLeft } from 'react-icons/fi';
import '../styles/signup.css';

function ProfileSetup() {
  // 2. 컴포넌트 최상단에서 navigate 함수 선언 (필수!)
  const navigate = useNavigate(); 

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
      <div className="profile-header-section">
        {/* 이제 navigate(-1)이 정상 작동합니다 */}
        <button type="button" className="back-button" onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </button>
        <div className="logo-group">
          <img src="/SPLogo.png" alt="Logo" className="header-logo" />
          <h1 className="header-brand">SkillPilot</h1>
        </div>
        <h2 className="header-title">프로필 설정</h2>
      </div>

      <form 
        className="signup-form" 
        onSubmit={(e) => { 
          e.preventDefault(); 
          // 설정 완료 시 이동할 경로
          navigate('/goalsetting'); 
        }}
      >
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

        {form.job === "대학생" && (
          <div className="input-group">
            <div className="label-with-icon">
              <FiBook className="label-icon" />
              <label>전공</label>
            </div>
            <input name="major" placeholder="전공을 입력하세요" onChange={handleChange} />
          </div>
        )}

        <div className="input-group">
          <div className="label-with-icon">
            <FiBriefcase className="label-icon" />
            <label>직무 관심 분야</label>
          </div>
          <input name="interest" placeholder="예: 백엔드 개발" onChange={handleChange} />
        </div>

        <button type="submit" className="complete-button">설정 완료</button>
      </form>
    </div>
  );
}

export default ProfileSetup;