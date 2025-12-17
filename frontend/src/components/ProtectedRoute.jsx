import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "../pages/Loading/Loading";
import { useEffect } from "react";

function ProtectedRoute({ children, redirect = "/" }) {
  const { user, loading, authFetch, updateUser } = useAuth();
  if (loading) return <Loading />;

  const location = useLocation();

  useEffect(() => {
    authFetch("/api/user/auth", { method: "POST" })
      .then((res) => res.json())
      .then((data) => updateUser(data.user));
  }, [location.pathname]);

  return !user ? <Navigate to={redirect} replace /> : <Outlet />;
}

export default ProtectedRoute;
