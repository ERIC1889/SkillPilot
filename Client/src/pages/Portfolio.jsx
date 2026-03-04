import { useState, useEffect } from "react";
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
import api from "../services/api";

export default function Portfolio() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    intro: { name: "", role: "", bio: "" },
    skills: [],
    certs: [],
    projects: [],
    links: [],
    activities: [],
    etc_content: ""
  });

  const [open, setOpen] = useState({
    intro: false, skill: false, cert: false, project: false,
    link: false, activity: false, etc: false
  });

  // Form states
  const [introForm, setIntroForm] = useState({ name: '', role: '', bio: '' });
  const [skillForm, setSkillForm] = useState('');
  const [certForm, setCertForm] = useState({ cert_name: '', year: '' });
  const [projectForm, setProjectForm] = useState({ title: '', tag: '', description: '' });
  const [linkForm, setLinkForm] = useState({ github: '', blog: '', portfolio: '' });
  const [activityForm, setActivityForm] = useState({ title: '', year: '', type: '대외활동' });
  const [etcForm, setEtcForm] = useState('');

  useEffect(() => {
    api.get('/portfolio')
      .then(res => {
        const d = res.data.data;
        setData({
          intro: { name: d.name || '', role: d.role || '', bio: d.bio || '' },
          skills: (d.skills || []).map(s => ({ id: s.id, name: s.skill_name })),
          certs: (d.certs || []).map(c => ({ id: c.id, name: c.cert_name, year: c.year })),
          projects: (d.projects || []).map(p => ({ id: p.id, title: p.title, tag: p.tag, desc: p.description })),
          links: (d.links || []).map(l => ({ label: l.label, value: l.url })),
          activities: (d.activities || []).map(a => ({ id: a.id, title: a.title, year: a.year, type: a.type })),
          etc_content: d.etc_content || ''
        });
      })
      .catch(() => {
        // Use empty defaults
      });
  }, []);

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSaveIntro = async () => {
    try {
      await api.put('/portfolio/intro', introForm);
      setData(prev => ({ ...prev, intro: { ...introForm } }));
      toggle('intro');
    } catch { /* ignore */ }
  };

  const handleAddSkill = async () => {
    if (!skillForm.trim()) return;
    try {
      const res = await api.post('/portfolio/skills', { skill_name: skillForm });
      setData(prev => ({ ...prev, skills: [...prev.skills, { id: res.data.data.id, name: skillForm }] }));
      setSkillForm('');
      toggle('skill');
    } catch { /* ignore */ }
  };

  const handleAddCert = async () => {
    if (!certForm.cert_name.trim()) return;
    try {
      const res = await api.post('/portfolio/certs', certForm);
      setData(prev => ({ ...prev, certs: [...prev.certs, { id: res.data.data.id, name: certForm.cert_name, year: certForm.year }] }));
      setCertForm({ cert_name: '', year: '' });
      toggle('cert');
    } catch { /* ignore */ }
  };

  const handleAddProject = async () => {
    if (!projectForm.title.trim()) return;
    try {
      const res = await api.post('/portfolio/projects', projectForm);
      setData(prev => ({ ...prev, projects: [...prev.projects, { id: res.data.data.id, title: projectForm.title, tag: projectForm.tag, desc: projectForm.description }] }));
      setProjectForm({ title: '', tag: '', description: '' });
      toggle('project');
    } catch { /* ignore */ }
  };

  const handleSaveLinks = async () => {
    const links = [
      { label: 'GitHub', url: linkForm.github },
      { label: 'Blog', url: linkForm.blog },
      { label: 'Portfolio', url: linkForm.portfolio },
    ].filter(l => l.url);
    try {
      await api.put('/portfolio/links', { links });
      setData(prev => ({ ...prev, links: links.map(l => ({ label: l.label, value: l.url })) }));
      toggle('link');
    } catch { /* ignore */ }
  };

  const handleAddActivity = async () => {
    if (!activityForm.title.trim()) return;
    try {
      const res = await api.post('/portfolio/activities', activityForm);
      setData(prev => ({ ...prev, activities: [...prev.activities, { id: res.data.data.id, ...activityForm }] }));
      setActivityForm({ title: '', year: '', type: '대외활동' });
      toggle('activity');
    } catch { /* ignore */ }
  };

  const handleSaveEtc = async () => {
    try {
      await api.put('/portfolio/etc', { etc_content: etcForm });
      setData(prev => ({ ...prev, etc_content: etcForm }));
      toggle('etc');
    } catch { /* ignore */ }
  };

  return (
    <div className="portfolio-wrapper">
      <header className="portfolio-header">
        <div className="portfolio-title">
          <img src={SPLogo} alt="SkillPilot Logo" className="portfolio-logo" />
          <h1>포트폴리오 빌더</h1>
        </div>
        <p>간편하게 포트폴리오를 만들고 공유하세요</p>
      </header>

      <div className="portfolio-layout">
        <div className="col">
          {/* Intro */}
          <section className="p-card">
            <div className="p-card-head">
              <div className="p-head-left"><span className="p-icon"><FiUser /></span><h3>소개</h3></div>
              <button className="p-action" onClick={() => { setIntroForm(data.intro); toggle("intro"); }}>
                <FiEdit2 />{open.intro ? "닫기" : "수정"}
              </button>
            </div>
            {!open.intro ? (
              <div className="p-content">
                <div className="p-field"><div className="p-label">이름</div><div className="p-value">{data.intro.name || '-'}</div></div>
                <div className="p-field"><div className="p-label">직무</div><div className="p-value">{data.intro.role || '-'}</div></div>
                <div className="p-field"><div className="p-label">소개</div><div className="p-value">{data.intro.bio || '-'}</div></div>
              </div>
            ) : (
              <div className="p-form">
                <div className="p-form-row"><label>이름</label><input placeholder="이름을 입력하세요" value={introForm.name} onChange={e => setIntroForm({...introForm, name: e.target.value})} /></div>
                <div className="p-form-row"><label>직무</label><input placeholder="예: 프론트엔드 개발자" value={introForm.role} onChange={e => setIntroForm({...introForm, role: e.target.value})} /></div>
                <div className="p-form-row"><label>소개</label><textarea placeholder="자기소개를 입력하세요" rows={4} value={introForm.bio} onChange={e => setIntroForm({...introForm, bio: e.target.value})} /></div>
                <button className="p-primary" onClick={handleSaveIntro}>저장</button>
              </div>
            )}
          </section>

          {/* Projects */}
          <section className="p-card">
            <div className="p-card-head">
              <div className="p-head-left"><span className="p-icon"><FiGift /></span><h3>프로젝트</h3></div>
              <button className="p-action" onClick={() => toggle("project")}><FiPlus />{open.project ? "닫기" : "추가"}</button>
            </div>
            <div className="p-content">
              {data.projects.map((p, idx) => (
                <div key={idx} className="project-item">
                  <div className="project-left">
                    <div className="project-title">{p.title}<span className="pill">{p.tag}</span></div>
                    <div className="project-desc">{p.desc}</div>
                  </div>
                  <button className="p-mini"><FiEdit2 /> 수정</button>
                </div>
              ))}
            </div>
            {open.project && (
              <div className="p-form">
                <div className="p-form-row"><label>프로젝트명</label><input placeholder="프로젝트명을 입력하세요" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} /></div>
                <div className="p-form-row"><label>분야</label><input placeholder="예: 웹 개발" value={projectForm.tag} onChange={e => setProjectForm({...projectForm, tag: e.target.value})} /></div>
                <div className="p-form-row"><label>설명</label><input placeholder="한 줄 설명" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} /></div>
                <div className="p-form-actions">
                  <button className="p-primary" onClick={handleAddProject}>추가</button>
                  <button className="p-ghost" onClick={() => toggle("project")}>취소</button>
                </div>
              </div>
            )}
          </section>

          {/* Links */}
          <section className="p-card">
            <div className="p-card-head">
              <div className="p-head-left"><span className="p-icon"><FiLink /></span><h3>링크</h3></div>
              <button className="p-action" onClick={() => {
                const gh = data.links.find(l => l.label === 'GitHub');
                const bl = data.links.find(l => l.label === 'Blog');
                const pf = data.links.find(l => l.label === 'Portfolio');
                setLinkForm({ github: gh?.value || '', blog: bl?.value || '', portfolio: pf?.value || '' });
                toggle("link");
              }}><FiPlus />{open.link ? "닫기" : "추가"}</button>
            </div>
            <div className="p-content">
              {data.links.map((l, idx) => (
                <div key={idx} className="link-row"><div className="link-label">{l.label}</div><div className="link-value">{l.value}</div></div>
              ))}
            </div>
            {open.link && (
              <div className="p-form">
                <div className="p-form-row"><label>GitHub</label><input placeholder="github.com/username" value={linkForm.github} onChange={e => setLinkForm({...linkForm, github: e.target.value})} /></div>
                <div className="p-form-row"><label>Blog</label><input placeholder="blog.example.com" value={linkForm.blog} onChange={e => setLinkForm({...linkForm, blog: e.target.value})} /></div>
                <div className="p-form-row"><label>Portfolio</label><input placeholder="portfolio.example.com" value={linkForm.portfolio} onChange={e => setLinkForm({...linkForm, portfolio: e.target.value})} /></div>
                <button className="p-primary" onClick={handleSaveLinks}>저장</button>
              </div>
            )}
          </section>
        </div>

        <div className="col">
          {/* Skills */}
          <section className="p-card">
            <div className="p-card-head">
              <div className="p-head-left"><span className="p-icon"><FiCode /></span><h3>기술 스택</h3></div>
              <button className="p-action" onClick={() => toggle("skill")}><FiPlus />{open.skill ? "닫기" : "추가"}</button>
            </div>
            <div className="p-content">
              <div className="chip-wrap">
                {data.skills.map((s, idx) => (<span key={idx} className="chip">{s.name}</span>))}
              </div>
            </div>
            {open.skill && (
              <div className="p-form">
                <div className="p-form-inline">
                  <input placeholder="예: React" value={skillForm} onChange={e => setSkillForm(e.target.value)} />
                  <button className="p-primary" onClick={handleAddSkill}>추가</button>
                </div>
                <div className="p-hint">기술 스택을 추가해보세요</div>
              </div>
            )}
          </section>

          {/* Certs */}
          <section className="p-card">
            <div className="p-card-head">
              <div className="p-head-left"><span className="p-icon"><FiAward /></span><h3>자격증</h3></div>
              <button className="p-action" onClick={() => toggle("cert")}><FiPlus />{open.cert ? "닫기" : "추가"}</button>
            </div>
            <div className="p-content">
              <div className="list">
                {data.certs.map((c, idx) => (
                  <div key={idx} className="list-row"><div className="list-left">{c.name}</div><div className="list-right">{c.year}</div></div>
                ))}
              </div>
            </div>
            {open.cert && (
              <div className="p-form">
                <div className="p-form-row"><label>자격증명</label><input placeholder="자격증명" value={certForm.cert_name} onChange={e => setCertForm({...certForm, cert_name: e.target.value})} /></div>
                <div className="p-form-row"><label>취득 연도</label><input placeholder="예: 2024" value={certForm.year} onChange={e => setCertForm({...certForm, year: e.target.value})} /></div>
                <div className="p-form-actions">
                  <button className="p-primary" onClick={handleAddCert}>추가</button>
                  <button className="p-ghost" onClick={() => toggle("cert")}>취소</button>
                </div>
                <div className="p-hint">자격증을 추가해보세요</div>
              </div>
            )}
          </section>

          {/* Activities */}
          <section className="p-card">
            <div className="p-card-head">
              <div className="p-head-left"><span className="p-icon"><FiBookOpen /></span><h3>활동 / 수상</h3></div>
              <button className="p-action" onClick={() => toggle("activity")}><FiPlus />{open.activity ? "닫기" : "추가"}</button>
            </div>
            <div className="p-content">
              <div className="list">
                {data.activities.map((a, idx) => (
                  <div key={idx} className="list-row"><div className="list-left">{a.title}</div><div className="list-right">{a.year} - {a.type}</div></div>
                ))}
              </div>
            </div>
            {open.activity && (
              <div className="p-form">
                <div className="p-form-row"><label>제목</label><input placeholder="제목" value={activityForm.title} onChange={e => setActivityForm({...activityForm, title: e.target.value})} /></div>
                <div className="p-form-row"><label>연도</label><input placeholder="예: 2024" value={activityForm.year} onChange={e => setActivityForm({...activityForm, year: e.target.value})} /></div>
                <div className="p-toggle-row">
                  <button className={`p-toggle ${activityForm.type === '대외활동' ? 'active' : ''}`} onClick={() => setActivityForm({...activityForm, type: '대외활동'})}>활동</button>
                  <button className={`p-toggle ${activityForm.type === '수상' ? 'active' : ''}`} onClick={() => setActivityForm({...activityForm, type: '수상'})}>수상</button>
                </div>
                <div className="p-form-actions">
                  <button className="p-primary" onClick={handleAddActivity}>추가</button>
                  <button className="p-ghost" onClick={() => toggle("activity")}>취소</button>
                </div>
                <div className="p-hint">활동이나 수상 내역을 추가해보세요</div>
              </div>
            )}
          </section>

          {/* Etc */}
          <section className="p-card">
            <div className="p-card-head">
              <div className="p-head-left"><span className="p-icon"><FiGift /></span><h3>기타</h3></div>
              <button className="p-action" onClick={() => { setEtcForm(data.etc_content); toggle("etc"); }}>
                {open.etc ? "닫기" : "추가"}
              </button>
            </div>
            {data.etc_content && !open.etc && (
              <div className="p-content"><p>{data.etc_content}</p></div>
            )}
            {open.etc && (
              <div className="p-form">
                <textarea placeholder="추가로 포함하고 싶은 내용을 작성하세요" rows={6} value={etcForm} onChange={e => setEtcForm(e.target.value)} />
                <button className="p-primary" onClick={handleSaveEtc}>저장</button>
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="portfolio-footer">
        <button className="create-btn" onClick={() => navigate("/portfolio/preview")}>
          포트폴리오 만들기
        </button>
        <p>완성된 포트폴리오를 다운로드하거나 링크로 공유할 수 있습니다</p>
      </div>
    </div>
  );
}
