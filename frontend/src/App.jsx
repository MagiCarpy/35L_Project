import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginSignup from "./pages/LoginSignup/LoginSignup";


function App() {
  // FIXME: define auth out here using useEffect

  //setting up useSate for user sessions
  const [user, setUser] = useState(null);

  //Check if user is login when the app start

  const logout = async () => {
    const resp = await fetch("/api/user/logout", {
      method: "GET",
      credentials: "include",
    });

    const data = resp.json();
    window.location.href = "/home";
    console.log("logged out");
  };

  return (
    <>
      {/* FIXME: Nav bar here? */}
      <div className="topnav">
        <a className="active" href="/home">
          Home
        </a>
        <a href="/profile">Profile</a>
        <a onClick={logout} className="split">
          Logout
        </a>
        <a href="/signup" className="split">
          Sign Up
        </a>
        <a href="/login" className="split">
          Login
        </a>
      </div>
      <br />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginSignup signingUp={false} />} />
          <Route path="/signup" element={<LoginSignup signingUp={true} />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
