import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import "./LoginSignup.css";

// FIXME: add logic (ex. redirect to home) if user is currently logged in.
function LoginSignup({ signingUp, isAuth, setAuthUser }) {
  const [loggingIn, setLoggingIn] = useState(!signingUp);
  const [err, setErr] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const REDIRECT_PATH = "/home";

  useEffect(() => {
    setLoggingIn(!signingUp);
  }, [signingUp]);

  // if logged in, don't allow access to this component
  if (isAuth) return <Navigate to={REDIRECT_PATH} replace />;

  const handleLogin = async (e) => {
    e.preventDefault();

    const resp = await fetch("/api/user/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await resp.json();

    if (resp.status !== 200) {
      setErr(data.message || "Login Failed. Try Again.");
      return null;
    }

    if (data) {
      await setAuthUser(false);
    }

    console.log("Logging In");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const resp = await fetch("/api/user/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await resp.json();

    if (resp.status !== 200) {
      setErr(data.message || "Signup Failed. Try Again.");
      return null;
    }

    if (data) {
      setLoggingIn(!loggingIn);
    }

    console.log("Signing Up");
  };

  const handleSwitch = (e, type) => {
    e.preventDefault();
    setLoggingIn(type === "login");
  };

  return (
    <div className="centered-card">
      <div style={{ display: "flex", gap: ".5rem", marginBottom: "0.75rem" }}>
        <button
          type="button"
          className={`switch-button ${!loggingIn && "unfocus-button"}`}
          onClick={(e) => handleSwitch(e, "login")}
        >
          Login
        </button>
        <button
          type="button"
          className={`switch-button ${loggingIn && "unfocus-button"}`}
          onClick={(e) => handleSwitch(e, "signup")}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={loggingIn ? handleLogin : handleSignup} className="form">
        {!loggingIn && (
          <label className="label-input">
            <p>Username</p>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              autoComplete="username"
              required
            />
          </label>
        )}

        <label className="label-input">
          <p>Email</p>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            autoComplete="email"
            required
          />
        </label>

        <label className="label-input">
          <p>Password</p>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            autoComplete={loggingIn ? "current-password" : "new-password"}
            required
          />
        </label>

        {err && <div className="error">{err}</div>}

        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}

export default LoginSignup;
