import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText, FiCloud, FiBarChart2, FiChevronLeft, FiCheck,
  FiBarChart, FiClock, FiCalendar, FiBriefcase, FiZap, FiPlusCircle,
  FiShield, FiDatabase, FiCpu, FiCode,
} from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/signup.css';

// 자격증 분야/키워드에 따라 아이콘 자동 선택
const pickIcon = (cert) => {
  const haystack = `${cert.title || ''} ${cert.field || ''}`.toLowerCase();
  if (haystack.includes('보안') || haystack.includes('security')) return <FiShield />;
  if (haystack.includes('데이터') || haystack.includes('sql') || haystack.includes('data')) return <FiDatabase />;
  if (haystack.includes('aws') || haystack.includes('클라우드') || haystack.includes('cloud')) return <FiCloud />;
  if (haystack.includes('빅데이터') || haystack.includes('분석')) return <FiBarChart2 />;
  if (haystack.includes('ai') || haystack.includes('인공지능')) return <FiCpu />;
  if (haystack.includes('리눅스') || haystack.includes('네트워크')) return <FiCode />;
  return <FiFileText />;
};

function CertificationRecommendation() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();
  const [selectedId, setSelectedId] = useState(null);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/certifications/recommended');
        const data = res.data?.data || [];
        if (!mounted) return;
        if (data.length === 0) {
          setError('추천할 자격증이 없습니다. 관리자에게 문의하세요.');
          return;
        }
        setCertifications(data.map((cert) => ({
          id: cert.id,
          title: cert.title,
          level: cert.level || '-',
          duration: cert.duration || '-',
          jobs: cert.jobs || cert.description || '',
          exam: cert.exam_info || '',
          tips: cert.tips || '',
          extra: cert.extra || cert.description || '',
          field: cert.field || '',
          passRate: cert.pass_rate,
          icon: pickIcon(cert),
          color: '#2B3A55',
        })));
      } catch (err) {
        if (!mounted) return;
        setError(err.response?.data?.message || '추천 자격증을 불러올 수 없습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSelect = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await api.post('/certifications/select', { certificationIds: [selectedId] });
      await refreshMe();
      const selected = certifications.find((c) => c.id === selectedId);
      localStorage.setItem(
        'selectedCert',
        JSON.stringify({ certId: selectedId, certTitle: selected?.title || '' })
      );
      navigate('/WeeklyRoadmap', { state: { certId: selectedId, certTitle: selected?.title } });
    } catch (err) {
      setError(err.response?.data?.message || '자격증 선택에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

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
        <p className="header-desc">당신의 프로필과 목표에 맞춘 자격증입니다.</p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          추천 자격증을 불러오는 중...
        </div>
      )}

      {!loading && error && (
        <div style={{ textAlign: 'center', padding: 40, color: '#c0392b' }}>
          {error}
        </div>
      )}

      {!loading && !error && certifications.length > 0 && (
        <div className="recommend-list">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className={`recommend-card ${selectedId === cert.id ? 'active' : ''}`}
              onClick={() => setSelectedId(selectedId === cert.id ? null : cert.id)}
            >
              <div className="card-main-content">
                <div className="card-top">
                  <span className="card-icon" style={{ color: cert.color }}>{cert.icon}</span>
                  <h3 className="card-title">{cert.title}</h3>
                </div>

                <div className="card-info">
                  <div className="info-item">
                    <span className="info-label"><FiBarChart /> 자격구분</span>
                    <span className="info-value">{cert.level}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label"><FiClock /> 준비기간</span>
                    <span className="info-value">{cert.duration}</span>
                  </div>
                  {cert.passRate != null && (
                    <div className="info-item">
                      <span className="info-label">합격률</span>
                      <span className="info-value">{Number(cert.passRate).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="details-expanded">
                <div className="expanded-divider"></div>
                <div className="overlay-content">
                  {cert.jobs && <p><FiBriefcase /> <strong>관련직무:</strong> {cert.jobs}</p>}
                  {cert.exam && <p><FiCalendar /> <strong>시험정보:</strong> {cert.exam}</p>}
                  {cert.tips && <p><FiZap /> <strong>준비팁:</strong> {cert.tips}</p>}
                  {cert.extra && <p><FiPlusCircle /> <strong>추가정보:</strong> {cert.extra}</p>}
                </div>
              </div>

              <button
                className={`card-select-btn ${selectedId === cert.id ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(selectedId === cert.id ? null : cert.id);
                }}
              >
                {selectedId === cert.id ? <><FiCheck /> 선택됨</> : '선택하기'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="recommend-footer">
        <button
          className="final-submit-btn"
          disabled={!selectedId || submitting}
          onClick={handleSelect}
        >
          {submitting ? '처리 중...' : '선택 완료'}
        </button>
      </div>
    </div>
  );
}

export default CertificationRecommendation;
