import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "../pages/Loading/Loading";

function ProtectedRoute({ children, redirect = "/" }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;

  return !user ? <Navigate to={redirect} replace /> : <Outlet />;
}

export default ProtectedRoute;
