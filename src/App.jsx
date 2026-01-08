import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileSetup from "./pages/ProfileSetup"; 
import GoalSetting from "./pages/GoalSetting"; 
import CertificationRecommendation from "./pages/CertificationRecommendation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profilesetup" element={<ProfileSetup />} />
        <Route path="/goalsetting" element={<GoalSetting />} />
        <Route path="/CertificationRecommendation" element={<CertificationRecommendation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;