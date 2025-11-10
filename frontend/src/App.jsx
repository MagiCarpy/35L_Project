import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginSignup from "./pages/LoginSignup/LoginSignup";
import Loading from "./pages/Loading/Loading";

function App() {
  // FIXME: define auth out here using useEffect

  //setting up useState for user sessions
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated for all child routes
  const setAuthUser = async (loading = true) => {
    try {
      const authUser = await getProfile();
      setUser(authUser);
      console.log(authUser);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setAuthUser();
  }, []);

  const logout = async () => {
    const resp = await fetch("/api/user/logout", {
      method: "GET",
      credentials: "include",
    });
    const data = resp.json();
    setUser(null);
    window.location.href = "/home";

    console.log("logged out");
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      {/* FIXME: Nav bar here? */}
      <div className="topnav">
        <a className="active" href="/home">
          Home
        </a>
        <a href="/profile">Profile</a>
        {user && (
          <a onClick={logout} className="split">
            Logout
          </a>
        )}
        {!user && (
          <>
            <a href="/signup" className="split">
              Sign Up
            </a>
            <a href="/login" className="split">
              Login
            </a>
          </>
        )}
      </div>
      <br />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route
            path="/login"
            element={
              <LoginSignup
                signingUp={false}
                isAuth={user}
                setAuthUser={setAuthUser}
              />
            }
          />
          <Route
            path="/signup"
            element={
              <LoginSignup
                signingUp={true}
                isAuth={user}
                setAuthUser={setAuthUser}
              />
            }
          />
          <Route
            element={
              <ProtectedRoute
                user={user}
                isLoading={isLoading}
                redirect="/login"
              />
            }
          >
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

const getProfile = async () => {
  const resp = await fetch("/api/user/profile", {
    method: "GET",
    credentials: "include",
  });

  if (resp.status !== 200) return null;

  const data = await resp.json();

  return data.user;
};

export default App;
