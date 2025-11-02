import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ redirect = "/" }) {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuth();
      setAuthenticated(authenticated);
    };
    checkAuth();
  }, []);

  // FIXME: add loading page
  if (authenticated === null) return <h1>Loading...</h1>;

  return authenticated ? <Outlet /> : <Navigate to={redirect} replace />;
}

const isAuth = async () => {
  try {
    const resp = await fetch("/api/user/auth", {
      method: "GET",
      credentials: "include",
    });
    const data = await resp.json();
    const authenticated = !!data.authenticated;
    return authenticated;
  } catch (error) {
    return false;
  }
};

export default ProtectedRoute;
