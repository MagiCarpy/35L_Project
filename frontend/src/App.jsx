// App.jsx
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginSignup from "./pages/LoginSignup/LoginSignup";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // check session once on load
    fetch("/api/user/auth", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null));
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/user/logout", { method: "GET", credentials: "include" });
    } catch (_) {}
    setUser(null);
    window.location.assign("/home");
  };

  return (
    <BrowserRouter>
      <div className="topnav">
        <Link className="brand" to="/home">UCLA Delivery NetWork</Link>

        <div className="spacer" />

        <Link to="/home">Home</Link>
        {user && <Link to="/profile">Profile</Link>}

        {!user ? (
          <>
            <Link className="split" to="/signup">Sign Up</Link>
            <Link className="split" to="/login">Login</Link>
          </>
        ) : (
          <button className="split linklike" onClick={logout}>Logout</button>
        )}
      </div>

      <div className="pagewrap">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginSignup signingUp={false} />} />
          <Route path="/signup" element={<LoginSignup signingUp={true} />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
