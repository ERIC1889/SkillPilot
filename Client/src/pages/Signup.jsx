import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiChevronLeft } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import '../styles/signup.css';

function InputGroup({ icon, label, name, type = 'text', placeholder, value, onChange }) {
  return (
    <div className="input-group">
      <div className="label-with-icon">
        <span className="label-icon">{icon}</span>
        <label>{label}</label>
      </div>
      <input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} required />
    </div>
  );
}

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', passwordCheck: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.passwordCheck) return alert('비밀번호가 일치하지 않습니다');
    setError('');
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate('/profilesetup');
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-header">
        <button type="button" className="back-button" onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </button>

        <div className="logo-group">
          <img src="/SPLogo.png" alt="Logo" className="header-logo" />
          <h1 className="header-brand">SkillPilot</h1>
        </div>

        <h2 className="signup-title">회원가입</h2>
      </div>

      {error && <div style={{ color: '#dc2626', fontSize: '14px', textAlign: 'center', marginBottom: '12px' }}>{error}</div>}

      <form className="signup-form" onSubmit={handleSubmit}>
        <InputGroup icon={<FiUser />} label="이름" name="name" placeholder="이름 입력" value={form.name} onChange={handleChange} />
        <InputGroup icon={<FiMail />} label="이메일" name="email" type="email" placeholder="이메일 입력" value={form.email} onChange={handleChange} />
        <InputGroup icon={<FiLock />} label="비밀번호" name="password" type="password" placeholder="비밀번호 입력 (6자 이상)" value={form.password} onChange={handleChange} />
        <InputGroup icon={<FiLock />} label="비밀번호 확인" name="passwordCheck" type="password" placeholder="비밀번호 다시 입력" value={form.passwordCheck} onChange={handleChange} />
        <button type="submit" className="signup-button" disabled={loading}>
          {loading ? '가입 중...' : '가입하기'}
        </button>
      </form>

      <p className="signup-footer">
        이미 계정이 있으신가요? <Link to="/" style={{color: "#2563eb", fontWeight: "700"}}>로그인하기</Link>
      </p>
    </div>
  );
}

export default Signup;
