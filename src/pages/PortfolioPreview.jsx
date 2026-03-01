import { useNavigate } from "react-router-dom";
import "../styles/portfolioPreview.css";
import SPLogo from "../assets/logo.png";
export default function PortfolioPreview() {
  const navigate = useNavigate();

  return (
    <div className="preview-page">

      <div className="preview-container">
        <div className="preview-header">
            <img src={SPLogo} alt="logo" className="preview-logo" />
            <h2>미리보기</h2>
        </div>

        <div className="preview-card">
          <h1>김민수</h1>
          <h4>풀스택 개발자</h4>

          <section>
            <h3>소개</h3>
            <p>
              문제 해결을 즐기는 개발자입니다. 사용자 중심의 서비스를 만들기 위해 노력합니다.
            </p>
          </section>

          <section>
            <h3>기술 스택</h3>
            <div className="chip-wrap">
              <span className="chip">React</span>
              <span className="chip">TypeScript</span>
              <span className="chip">Node.js</span>
              <span className="chip">Python</span>
              <span className="chip">PostgreSQL</span>
              <span className="chip">AWS</span>
            </div>
          </section>

          <section>
            <h3>프로젝트</h3>
            <div className="preview-project">
              <strong>SkillPilot 학습 관리 시스템</strong>
              <p>AI 기반 맞춤형 학습 로드맵 제공 플랫폼</p>
            </div>

            <div className="preview-project">
              <strong>실시간 채팅 애플리케이션</strong>
              <p>WebSocket 기반 실시간 메시징 서비스</p>
            </div>
          </section>

          <section>
            <h3>자격증</h3>
            <ul>
              <li>정보처리기사 (2024)</li>
              <li>AWS Solutions Architect (2023)</li>
            </ul>
          </section>

          <section>
            <h3>링크</h3>
            <p>GitHub: github.com/username</p>
            <p>Blog: blog.example.com</p>
          </section>

          <section>
            <h3>활동 / 수상</h3>
            <ul>
              <li>금상 (2024) - 수상</li>
              <li>Hackertone (2020) - 활동</li>
            </ul>
          </section>
        </div>
      </div>

      <div className="preview-footer">
        <button
            className="create-btn"
            onClick={() => navigate("/dashboard")}
        >
            돌아가기
        </button>
      </div>

    </div>
  );
}