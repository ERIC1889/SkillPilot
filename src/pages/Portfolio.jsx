import { useState } from "react";
import {
  FiUser,
  FiCode,
  FiGift,
  FiAward,
  FiLink,
  FiBookOpen,
  FiPlus,
  FiEdit2
} from "react-icons/fi";

import "../styles/portfolio.css";
import SPLogo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

export default function Portfolio() {
    const navigate = useNavigate();
  // ✅ 디자인 확인용 더미 데이터 (나중에 실제 상태로 교체)
  const [data] = useState({
    intro: {
      name: "김민수",
      role: "풀스택 개발자",
      bio: "문제 해결을 즐기는 개발자입니다. 사용자 중심의 서비스를 만들기 위해 노력합니다."
    },
    skills: ["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "AWS"],
    certs: [
      { name: "정보처리기사", year: "2024" },
      { name: "AWS Solutions Architect", year: "2023" }
    ],
    projects: [
      { title: "SkillPilot 학습 관리 시스템", tag: "웹 개발", desc: "AI 기반 맞춤형 학습 로드맵 제공 플랫폼" },
      { title: "실시간 채팅 애플리케이션", tag: "백엔드", desc: "WebSocket 기반 실시간 메시징 서비스" }
    ],
    links: [
      { label: "GitHub", value: "github.com/username" },
      { label: "Blog", value: "blog.example.com" }
    ]
  });

  // ✅ 섹션별 편집(입력 폼 열기/닫기) 토글
  const [open, setOpen] = useState({
    intro: false,
    skill: false,
    cert: false,
    project: false,
    link: false,
    activity: false,
    etc: false
  });

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="portfolio-wrapper">
      {/* HEADER */}
      <header className="portfolio-header">
        <div className="portfolio-title">
          <img src={SPLogo} alt="SkillPilot Logo" className="portfolio-logo" />
          <h1>포트폴리오 빌더</h1>
        </div>
        <p>간편하게 포트폴리오를 만들고 공유하세요</p>
      </header>

      {/* MAIN GRID (좌/우 컬럼) */}
      <div className="portfolio-layout">
        {/* LEFT COLUMN */}
        <div className="col">
          {/* 소개 */}
          <section className="p-card">
            <div className="p-card-head">
              <div className="p-head-left">
                <span className="p-icon">
                  <FiUser />
                </span>
                <h3>소개</h3>
              </div>

              <button className="p-action" onClick={() => toggle("intro")}>
                <FiEdit2 />
                {open.intro ? "닫기" : "수정"}
              </button>
            </div>

            {!open.intro ? (
              <div className="p-content">
                <div className="p-field">
                  <div className="p-label">이름</div>
                  <div className="p-value">{data.intro.name}</div>
                </div>
                <div className="p-field">
                  <div className="p-label">직무</div>
                  <div className="p-value">{data.intro.role}</div>
                </div>
                <div className="p-field">
                  <div className="p-label">소개</div>
                  <div className="p-value">{data.intro.bio}</div>
                </div>
              </div>
            ) : (
              <div className="p-form">
                <div className="p-form-row">
                  <label>이름</label>
                  <input placeholder="이름을 입력하세요" />
                </div>
                <div className="p-form-row">
                  <label>직무</label>
                  <input placeholder="예: 프론트엔드 개발자" />
                </div>
                <div className="p-form-row">
                  <label>소개</label>
                  <textarea placeholder="자기소개를 입력하세요" rows={4} />
                </div>
                <button className="p-primary" onClick={() => toggle("intro")}>
                  저장
                </button>
              </div>
            )}
          </section>

          {/* 프로젝트 */}
          <section className="p-card">
            <div className="p-card-head">
              <div className="p-head-left">
                <span className="p-icon">
                  <FiGift />
                </span>
                <h3>프로젝트</h3>
              </div>

              <button className="p-action" onClick={() => toggle("project")}>
                <FiPlus />
                {open.project ? "닫기" : "추가"}
              </button>
            </div>

            <div className="p-content">
              {data.projects.map((p, idx) => (
                <div key={idx} className="project-item">
                  <div className="project-left">
                    <div className="project-title">
                      {p.title}
                      <span className="pill">{p.tag}</span>
                    </div>
                    <div className="project-desc">{p.desc}</div>
                  </div>
                  <button className="p-mini">
                    <FiEdit2 /> 수정
                  </button>
                </div>
              ))}
            </div>

            {open.project && (
              <div className="p-form">
                <div className="p-form-row">
                  <label>프로젝트명</label>
                  <input placeholder="프로젝트명을 입력하세요" />
                </div>
                <div className="p-form-row">
                  <label>분야</label>
                  <input placeholder="예: 웹 개발" />
                </div>
                <div className="p-form-row">
                  <label>설명</label>
                  <input placeholder="한 줄 설명" />
                </div>

                <div className="p-form-actions">
                  <button className="p-primary" onClick={() => toggle("project")}>
                    추가
                  </button>
                  <button className="p-ghost" onClick={() => toggle("project")}>
                    취소
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* 링크 */}
          <section className="p-card">
            <div className="p-card-head">
              <div className="p-head-left">
                <span className="p-icon">
                  <FiLink />
                </span>
                <h3>링크</h3>
              </div>

              <button className="p-action" onClick={() => toggle("link")}>
                <FiPlus />
                {open.link ? "닫기" : "추가"}
              </button>
            </div>

            <div className="p-content">
              {data.links.map((l, idx) => (
                <div key={idx} className="link-row">
                  <div className="link-label">{l.label}</div>
                  <div className="link-value">{l.value}</div>
                </div>
              ))}
            </div>

            {open.link && (
              <div className="p-form">
                <div className="p-form-row">
                  <label>GitHub</label>
                  <input placeholder="github.com/username" />
                </div>
                <div className="p-form-row">
                  <label>Blog</label>
                  <input placeholder="blog.example.com" />
                </div>
                <div className="p-form-row">
                  <label>Portfolio</label>
                  <input placeholder="portfolio.example.com" />
                </div>
                <button className="p-primary" onClick={() => toggle("link")}>
                  저장
                </button>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col">
          {/* 기술 스택 */}
          <section className="p-card">
            <div className="p-card-head">
              <div className="p-head-left">
                <span className="p-icon">
                  <FiCode />
                </span>
                <h3>기술 스택</h3>
              </div>

              <button className="p-action" onClick={() => toggle("skill")}>
                <FiPlus />
                {open.skill ? "닫기" : "추가"}
              </button>
            </div>

            <div className="p-content">
              <div className="chip-wrap">
                {data.skills.map((s, idx) => (
                  <span key={idx} className="chip">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {open.skill && (
              <div className="p-form">
                <div className="p-form-inline">
                  <input placeholder="예: React" />
                  <button className="p-primary" onClick={() => toggle("skill")}>
                    추가
                  </button>
                </div>
                <div className="p-hint">기술 스택을 추가해보세요</div>
              </div>
            )}
          </section>

          {/* 자격증 */}
          <section className="p-card">
            <div className="p-card-head">
              <div className="p-head-left">
                <span className="p-icon">
                  <FiAward />
                </span>
                <h3>자격증</h3>
              </div>

              <button className="p-action" onClick={() => toggle("cert")}>
                <FiPlus />
                {open.cert ? "닫기" : "추가"}
              </button>
            </div>

            <div className="p-content">
              <div className="list">
                {data.certs.map((c, idx) => (
                  <div key={idx} className="list-row">
                    <div className="list-left">{c.name}</div>
                    <div className="list-right">{c.year}</div>
                  </div>
                ))}
              </div>
            </div>

            {open.cert && (
              <div className="p-form">
                <div className="p-form-row">
                  <label>자격증명</label>
                  <input placeholder="자격증명" />
                </div>
                <div className="p-form-row">
                  <label>취득 연도</label>
                  <input placeholder="예: 2024" />
                </div>
                <div className="p-form-actions">
                  <button className="p-primary" onClick={() => toggle("cert")}>
                    추가
                  </button>
                  <button className="p-ghost" onClick={() => toggle("cert")}>
                    취소
                  </button>
                </div>
                <div className="p-hint">자격증을 추가해보세요</div>
              </div>
            )}
          </section>

          {/* 활동/수상, 기타는 “빈 카드 + 추가 버튼”만 먼저 */}
          <section className="p-card">
            <div className="p-card-head">
              <div className="p-head-left">
                <span className="p-icon">
                  <FiBookOpen />
                </span>
                <h3>활동 / 수상</h3>
              </div>
              <button className="p-action" onClick={() => toggle("activity")}>
                <FiPlus />
                {open.activity ? "닫기" : "추가"}
              </button>
            </div>

            {open.activity && (
              <div className="p-form">
                <div className="p-form-row">
                  <label>제목</label>
                  <input placeholder="제목" />
                </div>
                <div className="p-form-row">
                  <label>연도</label>
                  <input placeholder="예: 2024" />
                </div>
                <div className="p-toggle-row">
                  <button className="p-toggle active">활동</button>
                  <button className="p-toggle">수상</button>
                </div>
                <div className="p-form-actions">
                  <button className="p-primary" onClick={() => toggle("activity")}>
                    추가
                  </button>
                  <button className="p-ghost" onClick={() => toggle("activity")}>
                    취소
                  </button>
                </div>
                <div className="p-hint">활동이나 수상 내역을 추가해보세요</div>
              </div>
            )}
          </section>

          <section className="p-card">
            <div className="p-card-head">
              <div className="p-head-left">
                <span className="p-icon">
                  <FiGift />
                </span>
                <h3>기타</h3>
              </div>
              <button className="p-action" onClick={() => toggle("etc")}>
                {open.etc ? "닫기" : "추가"}
              </button>
            </div>

            {open.etc && (
              <div className="p-form">
                <textarea placeholder="추가로 포함하고 싶은 내용을 작성하세요" rows={6} />
                <button className="p-primary" onClick={() => toggle("etc")}>
                  저장
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* FOOTER CTA */}
      <div className="portfolio-footer">
        <button
        className="create-btn"
        onClick={() => navigate("/portfolio/preview")}
        >
        포트폴리오 만들기
        </button>
        <p>완성된 포트폴리오를 다운로드하거나 링크로 공유할 수 있습니다</p>
      </div>
    </div>
  );
}