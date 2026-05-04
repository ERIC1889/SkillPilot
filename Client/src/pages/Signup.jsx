import { useId, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiChevronLeft } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui';
import '../styles/signup.css';

function InputGroup({ icon, label, name, type = 'text', placeholder, value, onChange, autoComplete }) {
  const reactId = useId();
  const id = `signup-${name}-${reactId}`;
  return (
    <div className="input-group">
      <label className="label-with-icon" htmlFor={id}>
        <span className="label-icon" aria-hidden="true">{icon}</span>
        <span>{label}</span>
      </label>
      <input
        id={id}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
      />
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
    if (form.password !== form.passwordCheck) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }
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
    <main className="signup-wrapper">
      <header className="signup-header">
        <button type="button" className="back-button" onClick={() => navigate(-1)} aria-label="이전 페이지로 돌아가기">
          <FiChevronLeft aria-hidden="true" />
        </button>

        <div className="logo-group">
          <img src="/SPLogo.png" alt="" aria-hidden="true" className="header-logo" />
          <h1 className="header-brand">SkillPilot</h1>
        </div>

        <h2 className="signup-title">회원가입</h2>
      </header>

      {error && <div className="signup-error" role="alert">{error}</div>}

      <form className="signup-form" onSubmit={handleSubmit} noValidate>
        <InputGroup icon={<FiUser />} label="이름" name="name" placeholder="이름 입력" value={form.name} onChange={handleChange} autoComplete="name" />
        <InputGroup icon={<FiMail />} label="이메일" name="email" type="email" placeholder="이메일 입력" value={form.email} onChange={handleChange} autoComplete="email" />
        <InputGroup icon={<FiLock />} label="비밀번호" name="password" type="password" placeholder="비밀번호 입력 (6자 이상)" value={form.password} onChange={handleChange} autoComplete="new-password" />
        <InputGroup icon={<FiLock />} label="비밀번호 확인" name="passwordCheck" type="password" placeholder="비밀번호 다시 입력" value={form.passwordCheck} onChange={handleChange} autoComplete="new-password" />
        <Button type="submit" fullWidth size="lg" loading={loading}>
          {loading ? '가입 중...' : '가입하기'}
        </Button>
      </form>

      <p className="signup-footer">
        이미 계정이 있으신가요? <Link to="/" className="signup-footer-link">로그인하기</Link>
      </p>
    </main>
  );
}

export default Signup;
