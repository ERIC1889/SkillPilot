import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAward, FiBook, FiBriefcase, FiShoppingBag, FiChevronLeft } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui';
import '../styles/signup.css';

function ProfileSetup() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();
  const [form, setForm] = useState({
    job: '',
    grade: '',
    major: '',
    interest: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'job') {
      setForm(prev => ({ ...prev, [name]: value, grade: '', major: '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/profile/setup', {
        job: form.job,
        grade: form.grade || null,
        major: form.major || null,
        interest: form.interest || null,
      });
      await refreshMe();
      navigate('/goalsetting');
    } catch (err) {
      setError(err.response?.data?.message || '프로필 설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-wrapper">
      <header className="profile-header-section">
        <button type="button" className="back-button" onClick={() => navigate(-1)} aria-label="이전 페이지로 돌아가기">
          <FiChevronLeft aria-hidden="true" />
        </button>
        <div className="logo-group">
          <img src="/SPLogo.png" alt="" aria-hidden="true" className="header-logo" />
          <h1 className="header-brand">SkillPilot</h1>
        </div>
        <h2 className="header-title" style={{ width: '100%', justifyContent: 'center' }}>프로필 설정</h2>
      </header>

      {error && <div className="signup-error" role="alert">{error}</div>}

      <form className="signup-form" onSubmit={handleSubmit} noValidate>
        <div className="input-group">
          <label className="label-with-icon" htmlFor="profile-job">
            <FiShoppingBag className="label-icon" aria-hidden="true" />
            <span>직업</span>
          </label>
          <select id="profile-job" name="job" value={form.job} onChange={handleChange} required>
            <option value="" disabled hidden>직업 선택</option>
            <option value="고등학생">고등학생</option>
            <option value="대학생">대학생</option>
            <option value="취업준비생">취업준비생</option>
            <option value="직장인">직장인</option>
          </select>
        </div>

        {(form.job === "고등학생" || form.job === "대학생") && (
          <div className="input-group">
            <label className="label-with-icon" htmlFor="profile-grade">
              <FiAward className="label-icon" aria-hidden="true" />
              <span>학년</span>
            </label>
            <select id="profile-grade" name="grade" value={form.grade} onChange={handleChange} required>
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
            <label className="label-with-icon" htmlFor="profile-major">
              <FiBook className="label-icon" aria-hidden="true" />
              <span>전공</span>
            </label>
            <input id="profile-major" name="major" placeholder="전공을 입력하세요" value={form.major} onChange={handleChange} />
          </div>
        )}

        <div className="input-group">
          <label className="label-with-icon" htmlFor="profile-interest">
            <FiBriefcase className="label-icon" aria-hidden="true" />
            <span>직무 관심 분야</span>
          </label>
          <input id="profile-interest" name="interest" placeholder="예: 백엔드 개발" value={form.interest} onChange={handleChange} />
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading} className="complete-button-spacing">
          {loading ? '설정 중...' : '설정 완료'}
        </Button>
      </form>
    </main>
  );
}

export default ProfileSetup;
