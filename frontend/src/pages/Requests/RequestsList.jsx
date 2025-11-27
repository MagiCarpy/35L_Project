import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";

function RequestsList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Load logged-in user ID
  const fetchUser = async () => {
    const resp = await fetch("/api/user/me", { credentials: "include" });
    if (resp.ok) {
      const data = await resp.json();
      setCurrentUserId(data.userId);
    }
  };

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
    fetchRequests(); // refresh UI state
  };

  const deleteRequest = async (id) => {
    await fetch(`/api/requests/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchRequests(); // refresh UI state
  };

  // Load both user + requests on mount
  useEffect(() => {
    fetchUser();
    fetchRequests();
  }, []);

  if (loading) return <p>Getting Requests...</p>;

  // Compute whether user has an active delivery
  const currentUserHasActiveDelivery = requests.some(
    (r) => r.status === "accepted" && r.helperId === currentUserId
  );

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">All Requests</h2>

      {currentUserHasActiveDelivery && (
        <div className="mb-4 p-3 rounded-md bg-yellow-100 text-yellow-800 border border-yellow-300">
          You already have an active delivery. You must finish it before
          accepting another.
        </div>
      )}

      {requests.length === 0 && <p>No requests yet.</p>}

      {requests.map((r) => {
        const isAcceptedByUser =
          r.status === "accepted" && r.helperId === currentUserId;

        return (
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
              <strong>Status:</strong>{" "}
              {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
            </p>
            <p>
              <strong>Requested by:</strong> {r.userId}
            </p>
            <p>
              <strong>Accepted by:</strong> {r.helperId ? r.helperId : "—"}
            </p>

            <div className="mt-4 flex gap-2">
              {/* ACCEPT BUTTON */}
              {r.status === "open" && (
                <>
                  {currentUserHasActiveDelivery ? (
                    <Button
                      disabled
                      className="bg-gray-300 text-gray-600 cursor-not-allowed"
                    >
                      Busy
                    </Button>
                  ) : (
                    <Button
                      onClick={() => acceptRequest(r.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Accept
                    </Button>
                  )}
                </>
              )}

              {/* DELETE button (same as original) */}
              <Button
                variant="destructive"
                onClick={() => deleteRequest(r.id)}
              >
                Delete
              </Button>
            </div>

            {/* Highlight when it's YOUR accepted delivery */}
            {isAcceptedByUser && (
              <div className="mt-3 p-2 rounded-md bg-blue-100 text-blue-800 border border-blue-300">
                You are currently delivering this request.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default RequestsList;
