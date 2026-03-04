import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/portfolioPreview.css";
import SPLogo from "../assets/logo.png";
import api from "../services/api";

export default function PortfolioPreview() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/portfolio')
      .then(res => setData(res.data.data))
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="preview-page">
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          포트폴리오를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="preview-page">
      <div className="preview-container">
        <div className="preview-header">
          <img src={SPLogo} alt="logo" className="preview-logo" />
          <h2>미리보기</h2>
        </div>

        <div className="preview-card">
          <h1>{data.name || '이름 없음'}</h1>
          <h4>{data.role || '직무 미설정'}</h4>

          <section>
            <h3>소개</h3>
            <p>{data.bio || '소개가 없습니다.'}</p>
          </section>

          {data.skills?.length > 0 && (
            <section>
              <h3>기술 스택</h3>
              <div className="chip-wrap">
                {data.skills.map((s, i) => (
                  <span key={i} className="chip">{s.skill_name}</span>
                ))}
              </div>
            </section>
          )}

          {data.projects?.length > 0 && (
            <section>
              <h3>프로젝트</h3>
              {data.projects.map((p, i) => (
                <div key={i} className="preview-project">
                  <strong>{p.title}</strong>
                  <p>{p.description}</p>
                </div>
              ))}
            </section>
          )}

          {data.certs?.length > 0 && (
            <section>
              <h3>자격증</h3>
              <ul>
                {data.certs.map((c, i) => (
                  <li key={i}>{c.cert_name} ({c.year})</li>
                ))}
              </ul>
            </section>
          )}

          {data.links?.length > 0 && (
            <section>
              <h3>링크</h3>
              {data.links.map((l, i) => (
                <p key={i}>{l.label}: {l.url}</p>
              ))}
            </section>
          )}

          {data.activities?.length > 0 && (
            <section>
              <h3>활동 / 수상</h3>
              <ul>
                {data.activities.map((a, i) => (
                  <li key={i}>{a.title} ({a.year}) - {a.type}</li>
                ))}
              </ul>
            </section>
          )}

          {data.etc_content && (
            <section>
              <h3>기타</h3>
              <p>{data.etc_content}</p>
            </section>
          )}
        </div>
      </div>

      <div className="preview-footer">
        <button className="create-btn" onClick={() => navigate("/dashboard")}>
          돌아가기
        </button>
      </div>
    </div>
  );
}
