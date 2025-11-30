export async function fetchUserStats() {
  const res = await fetch("/api/requests/user/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}
