// LoginSignup.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginSignup.css";

const API = import.meta.env.VITE_API_BASE || "";

function LoginSignup({ signingUp }) {
  const [loggingIn, setLoggingIn] = useState(!signingUp);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  // If already authenticated, bounce to /home
  useEffect(() => {
    fetch(`${API}/api/user/auth`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d?.user) navigate("/home", { replace: true }); })
      .catch(() => {});
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    if (!formData.email || !formData.password) {
      setErr("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${API}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || (!data?.success && !data?.user)) {
        throw new Error(data?.error || "Login failed.");
      }
      navigate("/home", { replace: true });
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErr("");
    if (!formData.username || !formData.email || !formData.password) {
      setErr("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${API}/api/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.success) {
        throw new Error(data?.error || "Registration failed.");
      }
      setLoggingIn(true); // switch to login
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = (e, type) => {
    e.preventDefault();
    if (type === "login" && !loggingIn) setLoggingIn(true);
    if (type === "signup" && loggingIn) setLoggingIn(false);
    setErr("");
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

      <form
        onSubmit={loggingIn ? handleLogin : handleSignup}
        className="form"
      >
        {!loggingIn && (
          <label className="label-input">
            <p>Username</p>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              autoComplete="username"
            />
          </label>
        )}

        <label className="label-input">
          <p>Email</p>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            autoComplete="email"
          />
        </label>

        <label className="label-input">
          <p>Password</p>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            autoComplete={loggingIn ? "current-password" : "new-password"}
          />
        </label>

        {err && <div className="error">{err}</div>}

        <div>
          <button type="submit" disabled={loading}>
            {loading ? (loggingIn ? "Logging in..." : "Creating account...") : (loggingIn ? "Login" : "Sign Up")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginSignup;
