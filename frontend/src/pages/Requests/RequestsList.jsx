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
    await fetch(`/api/requests/${id}/accept`, {
      method: "POST",
      credentials: "include",
    });
    fetchRequests(); // refresh UI
  };

  const deleteRequest = async (id) => {
    await fetch(`/api/requests/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchRequests(); // refresh UI
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
        <div
          key={r.id}
          style={{
            border: "1px solid gray",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
          }}
        >
          <p><strong>Item:</strong> {r.item}</p>
          <p><strong>Pickup:</strong> {r.pickupLocation}</p>
          <p><strong>Dropoff:</strong> {r.dropoffLocation}</p>
          <p><strong>Status:</strong> {r.status}</p>

          {/* accept button */}
          {r.status === "open" && (
            <button
              onClick={() => acceptRequest(r.id)}
              style={{
                marginRight: "10px",
                backgroundColor: "#4caf50",
                color: "white",
                padding: "5px 10px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Accept
            </button>
          )}

          {/* delete button */}
          <button
            onClick={() => deleteRequest(r.id)}
            style={{
              backgroundColor: "#ff4d4d",
              color: "white",
              padding: "5px 10px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default RequestsList;
