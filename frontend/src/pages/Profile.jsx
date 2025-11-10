import { useAuth } from "../auth/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const u = user?.user ?? user;
  return (
    <div className="centered-card">
      <h1>Welcome{u?.username ? `, ${u.username}` : ""}</h1>
      <pre className="code">{JSON.stringify(u, null, 2)}</pre>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
