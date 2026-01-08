import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiCloud, FiBarChart2, FiChevronLeft, FiCheck, FiBarChart, FiClock, FiCalendar, FiBriefcase, FiZap, FiPlusCircle } from 'react-icons/fi';
import '../styles/signup.css'; 

function CertificationRecommendation() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);

  const certifications = [
    { 
      id: 1, 
      title: "정보처리기사", 
      level: "중급", 
      duration: "3-4개월", 
      jobs: "SW 개발자, 시스템 엔지니어",
      exam: "연 3회 (3, 5, 9월 예정)",
      tips: "기출문제 위주 반복 학습이 중요",
      extra: "국가기술자격증 필수 스펙",
      icon: <FiFileText />, 
      color: "#2B3A55" 
    },
    { 
      id: 2, 
      title: "AWS Solutions Architect", 
      level: "중급", 
      duration: "2-3개월", 
      jobs: "클라우드 아키텍트, DevOps",
      exam: "상시 응시 가능 (온라인/오프라인)",
      tips: "실습 위주의 공식 백서 탐독 추천",
      extra: "글로벌 IT 기업 채용 시 우대",
      icon: <FiCloud />, 
      color: "#2B3A55" 
    },
    { 
      id: 3, 
      title: "빅데이터분석기사", 
      level: "고급", 
      duration: "4-6개월", 
      jobs: "데이터 사이언티스트, 분석가",
      exam: "연 2회 (4, 9월 예정)",
      tips: "Python/R 통계 분석 실무 연습 필요",
      extra: "데이터 기반 의사결정 역량 증명",
      icon: <FiBarChart2 />, 
      color: "#2B3A55" 
    }
  ];

  return (
    <div className="signup-wrapper recommendation-page">
      <div className="profile-header-section">
        <button type="button" className="back-button" onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </button>
        <div className="logo-group">
          <img src="/SPLogo.png" alt="Logo" className="header-logo" />
          <h1 className="header-brand">AI 추천 자격증 목록</h1>
        </div>
        <p className="header-desc">당신에게 맞는 자격증을 선택하세요.</p>
      </div>

      <div className="recommend-list">
        {certifications.map((cert) => (
          <div 
            key={cert.id} 
            className={`recommend-card ${selectedId === cert.id ? 'active' : ''}`}
            onClick={() => setSelectedId(selectedId === cert.id ? null : cert.id)}
          >
            {/* 1. 상단 기본 정보 영역 */}
            <div className="card-main-content">
              <div className="card-top">
                <span className="card-icon" style={{ color: cert.color }}>{cert.icon}</span>
                <h3 className="card-title">{cert.title}</h3>
              </div>
              
              <div className="card-info">
                <div className="info-item">
                  <span className="info-label"><FiBarChart /> 난이도</span>
                  <span className="info-value">{cert.level}</span>
                </div>
                <div className="info-item">
                  <span className="info-label"><FiClock /> 준비기간</span>
                  <span className="info-value">{cert.duration}</span>
                </div>
              </div>
            </div>

            {/* 2. 아래로 펼쳐지는 상세 정보 영역 */}
            <div className="details-expanded">
              <div className="expanded-divider"></div>
              <div className="overlay-content">
                <p><FiBriefcase /> <strong>관련직무:</strong> {cert.jobs}</p>
                <p><FiCalendar /> <strong>시험일정:</strong> {cert.exam}</p>
                <p><FiZap /> <strong>준비팁:</strong> {cert.tips}</p>
                <p><FiPlusCircle /> <strong>추가정보:</strong> {cert.extra}</p>
              </div>
            </div>

            <button className={`card-select-btn ${selectedId === cert.id ? 'selected' : ''}`}>
              {selectedId === cert.id ? <><FiCheck /> 선택됨</> : '선택하기'}
            </button>
          </div> /* <--- 이 닫는 태그가 누락되었었습니다! */
        ))}
      </div>

      <div className="recommend-footer">
        <button 
          className="final-submit-btn" 
          disabled={!selectedId} 
          onClick={() => {
            alert('자격증 선택이 완료되었습니다!');
            navigate('/');
          }}
        >
          선택 완료
        </button>
      </div>
    </div>
  );
}

export default CertificationRecommendation;