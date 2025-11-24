import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";

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

  if (loading) return <p>Getting Requests...</p>;

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">All Requests</h2>

      {requests.length === 0 && <p>No requests yet.</p>}

      {requests.map((r) => (
        <div
          key={r.id}
          className="border border-border p-4 mb-4 rounded-md shadow-sm bg-card text-card-foreground"
        >
          <p>
            <strong>Item:</strong> {r.item}
          </p>
          <p>
            <strong>Pickup:</strong> {r.pickupLocation}
          </p>
          <p>
            <strong>Dropoff:</strong> {r.dropoffLocation}
          </p>
          <p>
            <strong>Status:</strong> {r.status}
          </p>

          <div className="mt-4 flex gap-2">
            {/* accept button */}
            {r.status === "open" && (
              <Button
                onClick={() => acceptRequest(r.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Accept
              </Button>
            )}

            {/* delete button */}
            <Button
              variant="destructive"
              onClick={() => deleteRequest(r.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RequestsList;
