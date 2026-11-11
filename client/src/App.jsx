import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { RequireRole, useAuth } from "./auth.jsx";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import JudgePanel from "./pages/JudgePanel.jsx";
import Admin from "./pages/Admin.jsx";
import EventSuite from "./pages/EventSuite.jsx";

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="nav">
      <NavLink to="/" className="brand">
        <span className="brand-mark">H</span>
        <span>Hackathon<span className="brand-dot">.</span></span>
      </NavLink>
      <nav>
        <NavLink to="/register">Register team</NavLink>
        <NavLink to="/leaderboard">Leaderboard</NavLink>
        <NavLink to="/event">Event hub</NavLink>
        {user?.role === "judge" && <NavLink to="/judge">Score teams</NavLink>}
        {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
        {user ? (
          <button
            className="link-btn"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
            <span>Log out</span>
          </button>
        ) : (
          <NavLink to="/login">Judge / Admin login</NavLink>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <>
      <NavBar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/event" element={<EventSuite />} />
          <Route path="/judge" element={<RequireRole roles={["judge"]}><JudgePanel /></RequireRole>} />
          <Route path="/admin" element={<RequireRole roles={["admin"]}><Admin /></RequireRole>} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
