import { useEffect, useState } from "react";

function RequestsList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    const resp = await fetch("/api/requests", { credentials: "include" });
    const data = await resp.json();
    setRequests(data.requests || []);
    setLoading(false);
  };

  const acceptRequest = async (id) => {
    const resp = await fetch(`/api/requests/${id}/accept`, {
      method: "POST",
      credentials: "include",
    });
    await fetchRequests(); // refresh UI
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Requests</h2>

      {requests.length === 0 && <p>No requests yet.</p>}

      {requests.map((r) => (
        <div key={r.id} style={{ border: "1px solid gray", padding: "10px", marginBottom: "10px" }}>
          <p><strong>Item:</strong> {r.item}</p>
          <p><strong>Pickup:</strong> {r.pickupLocation}</p>
          <p><strong>Dropoff:</strong> {r.dropoffLocation}</p>
          <p><strong>Status:</strong> {r.status}</p>

          {r.status === "open" && (
            <button onClick={() => acceptRequest(r.id)}>
              Accept
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default RequestsList;
