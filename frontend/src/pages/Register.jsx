import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE ?? "http://localhost:5176";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.username || !form.email || !form.password) {
      setErr("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Register failed (${res.status})`);
      nav("/login", { replace: true });
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered-card">
      <h1>Create account</h1>
      <form onSubmit={onSubmit} className="form">
        <label>
          Username
          <input name="username" value={form.username} onChange={onChange} />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={onChange}/>
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={onChange}/>
        </label>
        {err && <div className="error">{err}</div>}
        <button disabled={loading} type="submit">{loading ? "..." : "Register"}</button>
      </form>
      <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
