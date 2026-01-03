import { BrowserRouter, Routes, Route } from "react-router-dom";
<<<<<<< HEAD
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileSetup from "./pages/ProfileSetup"; 
import GoalSetting from "./pages/GoalSetting"; 
=======

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileSetup from "./pages/ProfileSetup"; 
>>>>>>> 16f276d378b196c3c054e1830b29a4314b69f230

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profilesetup" element={<ProfileSetup />} />
<<<<<<< HEAD
        <Route path="/goalsetting" element={<GoalSetting />} />
=======
>>>>>>> 16f276d378b196c3c054e1830b29a4314b69f230
      </Routes>
    </BrowserRouter>
  );
}

export default App;