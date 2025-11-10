import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ user, isLoading, redirect = "/" }) {
  if (isLoading) return <h1>Loading...</h1>;
  return user ? <Outlet context={user} /> : <Navigate to={redirect} replace />;
}

export default ProtectedRoute;
