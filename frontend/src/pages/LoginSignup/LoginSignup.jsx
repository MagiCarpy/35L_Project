import React, { useState } from "react";
import "./LoginSignup.css";

export default function LoginSignup({ mode = "login", onAuth }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");

    const endpoint =
      mode === "signup" ? "/api/user/signup" : "/api/user/login";

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: mode === "signup" ? username : undefined,
          email,
          password,
        }),
      });

      const data = await resp.json();

      // 🔧 FIX #1 — show backend error correctly
      if (!resp.ok) {
        setErrMsg(data.msg || data.message || "Error");
        return;
      }

      // 🔧 FIX #2 — pass authenticated user to App.jsx
      if (onAuth) onAuth(data);

      window.location.href = "/profile";
    } catch (err) {
      setErrMsg("Network error");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <h2>{mode === "signup" ? "Sign Up" : "Login"}</h2>

      {errMsg && <p className="error">{errMsg}</p>}

      <form onSubmit={handleSubmit}>
        {mode === "signup" && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          {mode === "signup" ? "Create Account" : "Login"}
        </button>
      </form>
    </div>
  );
}
