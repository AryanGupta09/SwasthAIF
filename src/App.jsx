import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Diet from "./pages/Diet";
import Chat from "./pages/Chat";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import MealSwap from "./pages/MealSwap";
import Workout from "./pages/Workout";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/meal-swap" element={<MealSwap />} />
          <Route path="/workout" element={<Workout />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
