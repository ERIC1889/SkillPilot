import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileSetup from './pages/ProfileSetup';
import GoalSetting from './pages/GoalSetting';
import CertificationRecommendation from './pages/CertificationRecommendation';
import Dashboard from './pages/Dashboard';
import WeeklyRoadmap from './pages/WeeklyRoadmap';
import Portfolio from './pages/Portfolio';
import PortfolioPreview from './pages/PortfolioPreview';
import MockInterview from './pages/MockInterview';
import JobMatching from './pages/JobMatching';

// 온보딩 단계 → 라우트 경로 매핑
const STEP_TO_PATH = {
  profile: '/profilesetup',
  goal: '/goalsetting',
  certification: '/CertificationRecommendation',
  roadmap: '/WeeklyRoadmap',
  dashboard: '/dashboard',
};

// 해당 경로가 어느 스텝에 속하는지
const PATH_STEP = {
  '/profilesetup': 'profile',
  '/goalsetting': 'goal',
  '/CertificationRecommendation': 'certification',
  '/WeeklyRoadmap': 'roadmap',
};

function ProtectedRoute({ children, allowIncomplete = false }) {
  const { isAuthenticated, loading, onboarding } = useAuth();
  const location = useLocation();

  if (loading) return <div className="loading-screen">로딩중...</div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  // 온보딩이 완료되지 않았으면 현재 스텝으로 유도
  // 단, 온보딩 경로 자체는 접근을 허용 (사용자가 단계 진행 중)
  if (!allowIncomplete && onboarding && !onboarding.complete) {
    const currentPathStep = PATH_STEP[location.pathname];
    const targetPath = STEP_TO_PATH[onboarding.nextStep] || '/profilesetup';

    // 현재 경로가 온보딩 단계 경로이고, nextStep 보다 이후 단계라면 되돌림
    // (단순화: 현재 경로의 스텝이 nextStep 과 다르면 redirect)
    if (currentPathStep && currentPathStep !== onboarding.nextStep) {
      return <Navigate to={targetPath} replace />;
    }
    // 대시보드/포트폴리오/모의면접/채용매칭 등 완성 후 접근 페이지는 온보딩 필수
    const completionOnly = ['/dashboard', '/portfolio', '/portfolio/preview', '/mock-interview', '/job-matching'];
    if (completionOnly.includes(location.pathname)) {
      return <Navigate to={targetPath} replace />;
    }
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 온보딩 단계 (중간 접근 허용) */}
          <Route
            path="/profilesetup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goalsetting"
            element={
              <ProtectedRoute>
                <GoalSetting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/CertificationRecommendation"
            element={
              <ProtectedRoute>
                <CertificationRecommendation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/WeeklyRoadmap"
            element={
              <ProtectedRoute>
                <WeeklyRoadmap />
              </ProtectedRoute>
            }
          />

          {/* 온보딩 완료 후에만 접근 가능한 페이지 */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio/preview"
            element={
              <ProtectedRoute>
                <PortfolioPreview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mock-interview"
            element={
              <ProtectedRoute>
                <MockInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-matching"
            element={
              <ProtectedRoute>
                <JobMatching />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
