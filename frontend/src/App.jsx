import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginSignup from "./pages/LoginSignup/LoginSignup";
import RequestsList from "./pages/Requests/RequestsList";
import NewRequest from "./pages/Requests/NewRequest";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
    navigate("/home", { replace: true });

    console.log("logged out");
  };

  return (
    <>
      <div className="topnav">
        <Link className="brand" to="/home">
          UCLA Delivery NetWork
        </Link>

        <div className="spacer" />

        {user && <Link to="/profile">Profile</Link>}

        {!user ? (
          <>
            <Link className="split" to="/login">
              Login
            </Link>
            <Link className="split" to="/signup">
              Sign Up
            </Link>
          </>
        ) : (
          <Link className="split" to="/home" onClick={logout}>
            Logout
          </Link>
        )}
      </div>
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/home" element={<Home user={user} />} />
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
        
        <Route path="/requests" element={<RequestsList />} />
        <Route path="/requests/new" element={<NewRequest />} />

      </Routes>
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
