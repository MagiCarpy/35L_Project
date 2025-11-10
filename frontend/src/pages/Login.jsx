import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const API = import.meta.env.VITE_API_BASE ?? "http://localhost:5176";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const loc = useLocation();
  const { login } = useAuth();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.email || !form.password) {
      setErr("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Login failed (${res.status})`);
      }

      //accpts one of two- either token-based or simple user payloads.
      // 1) { token, user: { id, username, email } }
      // 2) { id, username, email }   (fallback)
      const authPayload = data?.user ? data : { user: data };
      login(authPayload);

      const dest = loc.state?.from?.pathname ?? "/profile";
      nav(dest, { replace: true });
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered-card">
      <h1>Login</h1>
      <form onSubmit={onSubmit} className="form">
        <label>
          Email
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={onChange}
            autoComplete="current-password"
          />
        </label>

        {err && <div className="error">{err}</div>}

        <button disabled={loading} type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="muted">
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
