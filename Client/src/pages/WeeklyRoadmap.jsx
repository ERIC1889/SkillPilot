import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FiStar, FiTarget, FiClock, FiBookOpen, FiEdit2, FiTrash2, FiPlus,
} from 'react-icons/fi';

import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/roadmap.css';

function SortableWeekCard({ week, index, onDelete, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: week.weekId });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="week-card" {...attributes} {...listeners}>
      <div className="card-header">
        <div className="week-number">{index + 1}</div>
        <span className="week-title">{week.title}</span>
        <div className="card-actions">
          <button
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(week);
            }}
          >
            <FiEdit2 size={14} />
          </button>
          <button
            className="icon-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(week.weekId);
            }}
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      <div className="week-content">
        <div className="info-group">
          <label><FiTarget size={14} /> 학습 목표</label>
          <p>{week.goal}</p>
        </div>
        <div className="info-group">
          <label><FiClock size={14} /> 학습 분량</label>
          <p>{week.time}</p>
        </div>
        <div className="info-group">
          <label><FiBookOpen size={14} /> 추천 자료</label>
          <ul>
            {(week.materials || []).map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function WeeklyRoadmap() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshMe } = useAuth();
  const stored = (() => {
    try {
      return JSON.parse(localStorage.getItem('selectedCert') || 'null');
    } catch {
      return null;
    }
  })();
  const certId = location.state?.certId ?? stored?.certId;
  const certTitle = location.state?.certTitle ?? stored?.certTitle;

  const [priority, setPriority] = useState('빠른 취득');
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadRoadmap = useCallback(async () => {
    if (!certId) {
      setError('자격증이 선택되지 않았습니다. 이전 단계로 돌아가세요.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/roadmap/generate', { certificationId: certId, priority });
      const data = res.data?.data;
      setWeeks(
        (data?.weeks || []).map((w, idx) => ({
          weekId: w.weekId || `week-${idx}-${Date.now()}`,
          title: w.title || `${idx + 1}주차`,
          goal: w.goal || '',
          time: w.time || '',
          materials: Array.isArray(w.materials) ? w.materials : [],
          order: w.order || idx + 1,
        }))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'AI 로드맵 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certId]);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = weeks.findIndex((w) => w.weekId === active.id);
    const newIndex = weeks.findIndex((w) => w.weekId === over.id);
    const reordered = arrayMove(weeks, oldIndex, newIndex).map((w, i) => ({ ...w, order: i + 1 }));
    setWeeks(reordered);

    try {
      await api.put('/roadmap/reorder', { weekOrder: reordered.map((w) => w.weekId) });
    } catch (err) {
      console.warn('reorder 저장 실패:', err);
    }
  };

  const deleteWeek = async (weekId) => {
    const prev = weeks;
    setWeeks(weeks.filter((w) => w.weekId !== weekId));
    try {
      await api.delete(`/roadmap/weeks/${weekId}`);
    } catch (err) {
      setWeeks(prev);
      setError(err.response?.data?.message || '주차 삭제 실패');
    }
  };

  const addWeek = async () => {
    const title = window.prompt('새 주차 제목을 입력하세요', `${weeks.length + 1}주차`);
    if (!title) return;
    try {
      const res = await api.post('/roadmap/weeks', {
        title,
        goal: '새 학습 목표',
        time: '하루 2시간 / 주 5일',
        materials: [],
      });
      const updated = res.data?.data;
      if (updated?.weeks) {
        setWeeks(updated.weeks);
      }
    } catch (err) {
      setError(err.response?.data?.message || '주차 추가 실패');
    }
  };

  const editWeek = async (week) => {
    const title = window.prompt('주차 제목', week.title);
    if (title === null) return;
    const goal = window.prompt('학습 목표', week.goal || '');
    if (goal === null) return;
    const time = window.prompt('학습 분량', week.time || '');
    if (time === null) return;

    try {
      const res = await api.put(`/roadmap/weeks/${week.weekId}`, { title, goal, time });
      const updated = res.data?.data;
      if (updated?.weeks) setWeeks(updated.weeks);
    } catch (err) {
      setError(err.response?.data?.message || '주차 수정 실패');
    }
  };

  const changePriority = async (item) => {
    setPriority(item);
    try {
      await api.put('/roadmap/priority', { certificationId: certId, priority: item });
    } catch {
      // 서버 실패 시 UI 우선 반영만 유지
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await refreshMe();
      navigate('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="roadmap-wrapper">
      <header className="roadmap-header">
        <h1 className="roadmap-title">
          <img src="/SPLogo.png" alt="logo" className="roadmap-logo" />
          {certTitle ? `${certTitle} 로드맵` : '주간 로드맵 생성'}
        </h1>
        <p>자격증 취득을 위한 맞춤형 학습 계획을 세워보세요</p>
      </header>

      <section className="white-box priority-section">
        <h3 className="section-title"><FiStar size={20} /> 학습 우선순위</h3>
        <div className="priority-buttons">
          {['빠른 취득', '깊이있는 학습', '균형잡힌 학습'].map((item) => (
            <button
              key={item}
              className={priority === item ? 'active' : ''}
              onClick={() => changePriority(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="white-box week-section">
        <h3 className="section-title"><FiTarget size={20} /> 주차별 학습 계획</h3>

        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            AI가 로드맵을 생성하고 있습니다...
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: 20, color: '#c0392b' }}>
            {error}
            <div style={{ marginTop: 12 }}>
              <button className="priority-buttons active" onClick={loadRoadmap}>다시 생성</button>
            </div>
          </div>
        )}

        {!loading && !error && weeks.length > 0 && (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={weeks.map((w) => w.weekId)}>
              <div className="week-grid">
                {weeks.map((week, index) => (
                  <SortableWeekCard
                    key={week.weekId}
                    week={week}
                    index={index}
                    onDelete={deleteWeek}
                    onEdit={editWeek}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {!loading && !error && (
          <button className="add-week-btn" onClick={addWeek}>
            <FiPlus size={18} /> 주차 추가
          </button>
        )}
      </section>

      <div className="footer-action">
        <button className="complete-btn" disabled={saving || loading || !!error} onClick={handleComplete}>
          {saving ? '저장 중...' : '로드맵 완성'}
        </button>
      </div>
    </div>
  );
}
