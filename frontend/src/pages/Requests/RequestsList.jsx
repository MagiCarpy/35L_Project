import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext";

function RequestsList() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState("all");

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
      <h2 className="text-2xl font-bold mb-4">Requests</h2>
      {/* Filter Options */}
      <select
        value={filterBy || "all"}
        onChange={(e) => setFilterBy(e.target.value)}
        className="filter border rounded-md px-3 py-2"
      >
        <option value="all">All Requests</option>
        <option value="25"> &lt;25 meters</option>
        <option value="50"> &lt;50 meters</option>
        <option value="75"> &lt;75 meters</option>
        <option value="100"> &lt;100 meters</option>
        <option value="150"> &lt;150 meters</option>
        <option value="200"> &lt;200 meters</option>
        <option value="300"> &lt;300 meters</option>
        <option value="400"> &lt;400 meters</option>
        <option value="500"> &gt;500 meters</option>
      </select>

      {/* Requests List */}
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
            {user && r.userId !== user.userId && r.status === "open" && (
              <Button
                onClick={() => acceptRequest(r.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Accept
              </Button>
            )}

            {/* delete button */}
            {r.userId === user.userId && (
              <Button variant="destructive" onClick={() => deleteRequest(r.id)}>
                Delete
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default RequestsList;
