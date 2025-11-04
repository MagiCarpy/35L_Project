import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginSignup.css";

// FIXME: add logic (ex. redirect to home) if user is currently logged in.
function LoginSignup() {
  const [loggingIn, setLoggingIn] = useState(true);
  const navigate = useNavigate();

  // Login State
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    const resp = await fetch("/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });
    const data = await resp.json();

    if (data.success) {
      console.log("redirecting...");
      return navigate("/home");
    }

    console.log("login");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const resp = await fetch("/api/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }),
    });
    const data = await resp.json();
    console.log(data);
    if (data.success) {
      console.log("redirecting to login");
      setLoggingIn(!loggingIn);
    }

    console.log("signup");
  };

  const handleSwitch = (e, type) => {
    e.preventDefault();
    if (type === "login") {
      loggingIn ? pass : setLoggingIn(!loggingIn);
    }
    if (type === "signup") {
      !loggingIn ? pass : setLoggingIn(!loggingIn);
    }
  };

  return (
    <div>
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

      <form
        onSubmit={loggingIn ? handleLogin : handleSignup}
        className="form-container"
      >
        {!loggingIn && (
          <label className="label-input">
            <p>Username</p>
            <input
              type="text"
              id="username"
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </label>
        )}
        <label className="label-input">
          <p>Email</p>
          <input
            type="email"
            id="email"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </label>
        <label className="label-input">
          <p>Password</p>
          <input
            type="password"
            id="password"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </label>
        <br />
        <br />
        <div>
          <button type="submit">{loggingIn ? "Login" : "Sign Up"}</button>
        </div>
      </form>
    </div>
  );
}

export default LoginSignup;
