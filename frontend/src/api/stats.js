import { API_BASE_URL } from "@/config";

export async function fetchUserStats() {
  const res = await fetch(`${API_BASE_URL}/api/requests/user/stats`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}
