import "./App.css";
import { Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginSignup from "./pages/LoginSignup/LoginSignup";
import RequestsList from "./pages/Requests/RequestsList";
import NewRequest from "./pages/Requests/NewRequest";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, logout } = useAuth();

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
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginSignup signingUp={false} />} />
        <Route path="/signup" element={<LoginSignup signingUp={true} />} />
        <Route element={<ProtectedRoute redirect="/login" />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/requests" element={<RequestsList />} />
          <Route path="/requests/new" element={<NewRequest />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
