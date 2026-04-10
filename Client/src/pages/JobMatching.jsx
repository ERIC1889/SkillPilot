// 채용 매칭 & 스킬갭 분석 페이지
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/jobMatching.css';

export default function JobMatching() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [gapRes, jobRes] = await Promise.all([
          api.get('/skill-gap'),
          api.get('/jobs/matches'),
        ]);
        if (!mounted) return;
        setData({
          gap: gapRes.data?.data,
          jobs: jobRes.data?.data || [],
        });
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || '데이터 로드 실패');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="jm-loading">분석 중...</div>;

  return (
    <div className="jm-page">
      <header className="jm-header">
        <button className="jm-back" onClick={() => navigate('/dashboard')}>← 대시보드</button>
        <h1>채용 매칭 & 스킬갭 분석</h1>
      </header>

      {error && <p className="jm-error">{error}</p>}

      {data?.gap && (
        <section className="jm-gap">
          <h2>스킬갭 분석</h2>
          {typeof data.gap.matchScore === 'number' && (
            <div className="jm-score">
              <strong>목표 직무 매칭도</strong>
              <span>{data.gap.matchScore}점</span>
            </div>
          )}
          {Array.isArray(data.gap.strengths) && data.gap.strengths.length > 0 && (
            <div className="jm-block">
              <h3>강점</h3>
              <ul>
                {data.gap.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {Array.isArray(data.gap.gaps) && data.gap.gaps.length > 0 && (
            <div className="jm-block">
              <h3>부족한 스킬</h3>
              <ul>
                {data.gap.gaps.map((g, i) => (
                  <li key={i}>
                    <strong>{g.skill}</strong>
                    <span className={`jm-priority jm-${g.priority}`}>{g.priority}</span>
                    <p>{g.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(data.gap.nextSteps) && data.gap.nextSteps.length > 0 && (
            <div className="jm-block">
              <h3>다음 액션</h3>
              <ol>
                {data.gap.nextSteps.map((n, i) => <li key={i}>{n}</li>)}
              </ol>
            </div>
          )}
        </section>
      )}

      <section className="jm-jobs">
        <h2>매칭된 채용 공고</h2>
        {data?.jobs?.length === 0 && <p className="jm-empty">매칭되는 공고가 없습니다.</p>}
        <div className="jm-job-list">
          {data?.jobs?.map((job) => (
            <article key={job.id} className="jm-job-card">
              <header>
                <h3>{job.title}</h3>
                <span className="jm-company">{job.company}</span>
              </header>
              <p className="jm-desc">{job.description}</p>
              <div className="jm-meta">
                {job.location && <span>📍 {job.location}</span>}
                {job.employment_type && <span>💼 {job.employment_type}</span>}
                {job.match_score != null && <span className="jm-match">매칭 {job.match_score}%</span>}
              </div>
              {Array.isArray(job.required_skills) && job.required_skills.length > 0 && (
                <div className="jm-skills">
                  {job.required_skills.map((s, i) => (
                    <span key={i} className="jm-skill-chip">{s}</span>
                  ))}
                </div>
              )}
              {job.url && (
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="jm-apply">
                  지원하기
                </a>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
