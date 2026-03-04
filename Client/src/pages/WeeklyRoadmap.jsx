import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  FiStar,
  FiTarget,
  FiClock,
  FiBookOpen,
  FiEdit2,
  FiTrash2,
  FiPlus
} from "react-icons/fi";

import api from "../services/api";
import "../styles/roadmap.css";

function SortableWeekCard({ week, index, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: week.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="week-card"
      {...attributes}
      {...listeners}
    >
      <div className="card-header">
        <div className="week-number">{index + 1}</div>
        <span className="week-title">{week.title}</span>
        <div className="card-actions">
          <button className="icon-btn">
            <FiEdit2 size={14} />
          </button>
          <button
            className="icon-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(week.id);
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
            {(week.materials || []).map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const defaultWeeks = [
  { id: "1", title: "1주차", goal: "프로그래밍 기초 이론", time: "하루 2시간 / 주 5일", materials: ["자료구조 기초", "C언어 기본 문법"] },
  { id: "2", title: "2주차", goal: "자료구조 심화 학습", time: "하루 2.5시간 / 주 5일", materials: ["스택과 큐", "트리 구조"] },
  { id: "3", title: "3주차", goal: "알고리즘 문제풀이", time: "하루 3시간 / 주 5일", materials: ["정렬 알고리즘", "탐색 알고리즘"] },
  { id: "4", title: "4주차", goal: "데이터베이스 기초", time: "하루 2시간 / 주 5일", materials: ["SQL 기본", "데이터 모델링"] },
];

export default function WeeklyRoadmap() {
  const navigate = useNavigate();
  const location = useLocation();
  const certId = location.state?.certId;
  const certTitle = location.state?.certTitle;

  const [priority, setPriority] = useState("빠른 취득");
  const [weeks, setWeeks] = useState(defaultWeeks);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (certId) {
      setLoading(true);
      api.post('/roadmap/generate', { certificationId: certId })
        .then(res => {
          const data = res.data.data;
          if (data?.weeks?.length > 0) {
            setWeeks(data.weeks.map((w, idx) => ({
              id: w.weekId || String(idx + 1),
              title: w.title || `${idx + 1}주차`,
              goal: w.goal || '',
              time: w.time || '',
              materials: w.materials || [],
            })));
          }
        })
        .catch(() => {
          // Use default weeks on error
        })
        .finally(() => setLoading(false));
    }
  }, [certId]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      setWeeks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const deleteWeek = (id) => {
    setWeeks((prev) =>
      prev
        .filter((w) => w.id !== id)
        .map((w, index) => ({
          ...w,
          title: `${index + 1}주차`
        }))
    );
  };

  const addWeek = () => {
    setWeeks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: `${prev.length + 1}주차`,
        goal: "새 학습 목표",
        time: "하루 2시간 / 주 5일",
        materials: []
      }
    ]);
  };

  const handleComplete = () => {
    navigate("/dashboard");
  };

  return (
    <div className="roadmap-wrapper">
      <header className="roadmap-header">
        <h1 className="roadmap-title">
          <img src="/SPLogo.png" alt="logo" className="roadmap-logo" />
          {certTitle ? `${certTitle} 로드맵` : "주간 로드맵 생성"}
        </h1>
        <p>자격증 취득을 위한 맞춤형 학습 계획을 세워보세요</p>
      </header>

      <section className="white-box priority-section">
        <h3 className="section-title">
          <FiStar size={20} /> 학습 우선순위
        </h3>
        <div className="priority-buttons">
          {["빠른 취득", "깊이있는 학습", "균형잡힌 학습"].map((item) => (
            <button
              key={item}
              className={priority === item ? "active" : ""}
              onClick={() => setPriority(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="white-box week-section">
        <h3 className="section-title">
          <FiTarget size={20} /> 주차별 학습 계획
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>AI가 로드맵을 생성하고 있습니다...</div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={weeks.map((w) => w.id)}>
              <div className="week-grid">
                {weeks.map((week, index) => (
                  <SortableWeekCard
                    key={week.id}
                    week={week}
                    index={index}
                    onDelete={deleteWeek}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <button className="add-week-btn" onClick={addWeek}>
          <FiPlus size={18} /> 주차 추가
        </button>
      </section>

      <div className="footer-action">
        <button className="complete-btn" onClick={handleComplete}>
          로드맵 완성
        </button>
      </div>
    </div>
  );
}
