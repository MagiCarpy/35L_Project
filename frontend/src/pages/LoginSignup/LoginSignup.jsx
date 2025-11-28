import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function LoginSignup({ signingUp }) {
  const { login, user } = useAuth();
  const [loggingIn, setLoggingIn] = useState(!signingUp);
  const [err, setErr] = useState("");
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  useEffect(() => setLoggingIn(!signingUp), [signingUp]);

  if (user) return <Navigate to="/Dashboard" replace />;

  async function handleLogin(e) {
    e.preventDefault();
    const resp = await login(formData.email, formData.password);

    if (!resp?.success) {
      setErr(resp?.message || "Login failed. Try again.");
      return;
    }

    navigate("/dashboard", { replace: true });
  }

  async function handleSignup(e) {
    e.preventDefault();

    const resp = await fetch("/api/user/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await resp.json();
    if (!resp.ok) {
      setErr(data.message || "Signup failed. Try again.");
      return;
    }

    setLoggingIn(true);
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-6">
      <Card className="w-full max-w-md border border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-blue-700 dark:text-blue-300">
            {loggingIn ? "Welcome Back" : "Create an Account"}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {/* Switcher */}
          <div className="flex gap-2 mb-2">
            <Button
              variant={loggingIn ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setLoggingIn(true)}
            >
              Login
            </Button>
            <Button
              variant={!loggingIn ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setLoggingIn(false)}
            >
              Sign Up
            </Button>
          </div>

          <form
            onSubmit={loggingIn ? handleLogin : handleSignup}
            className="flex flex-col gap-6"
          >
            {!loggingIn && (
              <div>
                <p className="text-sm font-medium mb-1">Username</p>
                <Input
                  autoComplete="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-1">Email</p>
              <Input
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Password</p>
              <Input
                type="password"
                autoComplete={loggingIn ? "current-password" : "new-password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {err && <div className="text-destructive text-sm text-center">{err}</div>}

            <Button type="submit" className="w-full">
              {loggingIn ? "Login" : "Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginSignup;
