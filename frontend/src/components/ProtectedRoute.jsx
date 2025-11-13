import { Navigate, Outlet } from "react-router-dom";
import Loading from "../pages/Loading/Loading";

function ProtectedRoute({ user, isLoading, redirect = "/login" }) {
  if (isLoading) return <Loading />;

  //If no user, kick em out
  if (!user) return <Navigate to={redirect} replace />;

  //Otherwise, render nested route
  return <Outlet />;
}

export default ProtectedRoute;
