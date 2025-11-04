import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ redirect = "/" }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authentication = await isAuth();
      setAuth(authentication);
    };

    checkAuth();
    console.log(auth);
  }, []);

  // FIXME: add loading page
  if (auth === null) return <h1>Loading...</h1>;
  const userId = auth.userId;
  return auth.authenticated ? (
    <Outlet context={{ userId }} />
  ) : (
    <Navigate to={redirect} replace />
  );
}

const isAuth = async () => {
  try {
    const resp = await fetch("/api/user/auth", {
      method: "GET",
      credentials: "include",
    });
    const data = await resp.json();
    const authenticated = !!data.authenticated;
    return { authenticated: authenticated, userId: data.userId };
  } catch (error) {
    return { authenticated: authenticated };
  }
};

export default ProtectedRoute;
