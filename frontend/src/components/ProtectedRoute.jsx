import { Navigate, Outlet } from "react-router-dom";
import Loading from "../pages/Loading/Loading";

function ProtectedRoute({ user, isLoading, redirect = "/" }) {
  if (isLoading) return <Loading />;
  return user ? <Outlet context={user} /> : <Navigate to={redirect} replace />;
}

export default ProtectedRoute;
