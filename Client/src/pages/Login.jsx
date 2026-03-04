import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import "../styles/login.css";

import logo from "../assets/logo.png";
import iconPersonal from "../assets/icons/icon-personal.png";
import iconTarget from "../assets/icons/icon-target.png";
import iconGrowth from "../assets/icons/icon-growth.png";
import emailIcon from "../assets/icons/icon-email.png";
import lockIcon from "../assets/icons/icon-lock.png";

function FeatureCard({ title, desc, icon }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <img src={icon} alt="" className="feature-icon-img" />
      </div>
      <div className="feature-title">{title}</div>
      <div className="feature-desc">{desc}</div>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="bg-left" />
      <div className="bg-right" />

      <div className="login-main-card">
        <section className="login-left-section">
          <div className="left-inner">
            <div className="logo-circle">
              <img src={logo} alt="SkillPilot Logo" className="logo-img" />
            </div>
            <h1 className="left-title">당신의 잠재력을 깨우세요</h1>
            <p className="left-sub">SkillPilot과 함께라면 어떤 목표든 달성할 수 있습니다</p>

            <div className="features-grid">
              <FeatureCard title="개인 맞춤" desc="개인화 자격증 추천 시스템" icon={iconPersonal} />
              <FeatureCard title="목표 달성" desc="체계적인 학습 관리" icon={iconTarget} />
              <FeatureCard title="성장 추적" desc="실시간 진도 확인" icon={iconGrowth} />
            </div>
          </div>
        </section>

        <section className="login-right-section">
          <div className="form-container">
            <h2 className="brand-title">SkillPilot</h2>
            <p className="brand-sub">자격증 취득을 향한 여정을 시작하세요</p>

            {error && <div className="error-message" style={{ color: '#dc2626', fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}>{error}</div>}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="field">
                <div className="label-row">
                  <img src={emailIcon} alt="" className="label-img" />
                  <span className="label-text">이메일</span>
                </div>
                <input
                  type="email"
                  className="input-field"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <div className="label-row">
                  <img src={lockIcon} alt="" className="label-img2" />
                  <span className="label-text">비밀번호</span>
                </div>
                <input
                  type="password"
                  className="input-field"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </form>

            <div className="divider">
              <span className="divider-line" />
              <span className="divider-text">또는</span>
              <span className="divider-line" />
            </div>

            <div className="social-row">
              <button className="social-btn"><FaGoogle /> Google</button>
              <button className="social-btn"><FaGithub /> GitHub</button>
            </div>

            <div className="signup-link-wrapper">
              계정이 없으신가요? <Link to="/signup" className="signup-link">회원가입</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
