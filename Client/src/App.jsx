import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileSetup from './pages/ProfileSetup';
import GoalSetting from './pages/GoalSetting';
import CertificationRecommendation from './pages/CertificationRecommendation';
import Dashboard from './pages/Dashboard';
import WeeklyRoadmap from './pages/WeeklyRoadmap';
import Portfolio from "./pages/Portfolio";
import PortfolioPreview from "./pages/PortfolioPreview";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-screen">로딩중...</div>;
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profilesetup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
          <Route path="/goalsetting" element={<ProtectedRoute><GoalSetting /></ProtectedRoute>} />
          <Route path="/CertificationRecommendation" element={<ProtectedRoute><CertificationRecommendation /></ProtectedRoute>} />
          <Route path="/WeeklyRoadmap" element={<ProtectedRoute><WeeklyRoadmap /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
          <Route path="/portfolio/preview" element={<ProtectedRoute><PortfolioPreview /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;