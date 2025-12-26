import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiBook, FiBriefcase, FiAward, FiChevronLeft, FiShoppingBag } from 'react-icons/fi';
import '../styles/signup.css';

function InputGroup({ icon, label, name, type = 'text', placeholder, onChange }) {
  return (
    <div className="input-group">
      <div className="label-with-icon">
        <span className="label-icon">{icon}</span>
        <label>{label}</label>
      </div>
      <input type={type} name={name} placeholder={placeholder} onChange={onChange} required />
    </div>
  );
}

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', passwordCheck: '', job: '', grade: '', major: '', interest: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // 만약 직업이 바뀌면 학년과 전공 초기화 (데이터 꼬임 방지)
    if (name === 'job') {
      setForm((prev) => ({ ...prev, [name]: value, grade: '', major: '' }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.passwordCheck) {
      alert('비밀번호가 일치하지 않습니다');
      return;
    }
    alert('계정이 생성되었습니다! 프로필을 설정해주세요.');
    navigate('/profilesetup');
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-header">
        <button type="button" className="back-button" onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </button>
        <img src="/SPLogo.png" alt="SkillPilot 로고" className="signup-logo" />
        <h1 className="signup-title">회원가입</h1>
      </div>
      <p className="signup-subtitle">SkillPilot과 함께 커리어 여정을 시작하세요</p>

      <form className="signup-form" onSubmit={handleSubmit}>
        <InputGroup icon={<FiUser />} label="이름" name="name" placeholder="이름 입력" onChange={handleChange} />
        <InputGroup icon={<FiMail />} label="이메일" name="email" type="email" placeholder="이메일 입력" onChange={handleChange} />
        <InputGroup icon={<FiLock />} label="비밀번호" name="password" type="password" placeholder="비밀번호 입력" onChange={handleChange} />
        <InputGroup icon={<FiLock />} label="비밀번호 확인" name="passwordCheck" type="password" placeholder="비밀번호 다시 입력" onChange={handleChange} />

        <button type="submit" className="signup-button">가입하기</button>
      </form>

      <p className="signup-footer">
        이미 계정이 있으신가요? <Link to="/login" style={{color: "#2563eb", fontWeight: "700"}}>로그인하기</Link>
      </p>
    </div>
  );
}

export default Signup;  