import "./App.css";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import LoginSignup from "./pages/LoginSignup/LoginSignup";
import ProtectedRoute from "./components/ProtectedRoute";
import MapPage from "./pages/Map/Map";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch logged-in user on load
  const setAuthUser = async () => {
    try {
      const resp = await fetch("/api/user/profile", {
        method: "GET",
        credentials: "include",
      });

      if (!resp.ok) {
        setUser(null);
        return;
      }

      const data = await resp.json();
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    setAuthUser();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/user/logout", {
        method: "GET",
        credentials: "include",           // ⭐ IMPORTANT
      });
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setUser(null);
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <div className="topnav">
        <Link className="brand" to="/home">My App</Link>
        <div className="spacer" />
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/map" element={<MapPage />} />

        <Route path="/login" element={<LoginSignup mode="login" />} />
        <Route path="/signup" element={<LoginSignup mode="signup" />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <Profile user={user} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
