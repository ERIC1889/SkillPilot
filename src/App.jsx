// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileSetup from './pages/ProfileSetup';
import GoalSetting from './pages/GoalSetting';
import CertificationRecommendation from './pages/CertificationRecommendation';
import Dashboard from './pages/Dashboard';
import WeeklyRoadmap from './pages/WeeklyRoadmap';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profilesetup" element={<ProfileSetup />} />
        <Route path="/goalsetting" element={<GoalSetting />} />
        <Route path="/CertificationRecommendation" element={<CertificationRecommendation />} />
        <Route path="/WeeklyRoadmap" element={<WeeklyRoadmap />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;