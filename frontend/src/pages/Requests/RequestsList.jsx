import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext";

function RequestsList() {
  const { user } = useAuth();
  const [userPos, setUserPos] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filterBy, setFilterBy] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPos([position.coords.latitude, position.coords.longitude]);
        //setUserPos([34.073319, -118.443325]); // FIXME: TEST USER LOCATION
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

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
        <option value="50"> &lt;50 meters</option>
        <option value="100"> &lt;100 meters</option>
        <option value="200"> &lt;200 meters</option>
        <option value="300"> &lt;300 meters</option>
        <option value="500"> &lt;500 meters</option>
        <option value="700"> &lt;700 meters</option>
        <option value="1000"> &lt;1000 meters</option>
        <option value="1500"> &lt;1500 meters</option>
        <option value="1500+"> &ge;1500 meters</option>
      </select>

      {/* Requests List */}
      {requests.length === 0 && <p>No requests yet.</p>}

      {requests
        .map((r) => {
          const pickup = [r.pickupLat, r.pickupLng];
          const dist = getDistance(userPos, pickup);
          const show = calcDistFilter(dist, filterBy);

          if (!show) return null;

          return (
            <div
              key={r.id}
              className="border border-border p-4 mb-4 rounded-md shadow-sm bg-card text-card-foreground"
            >
              <h1>{[r.pickupLat, r.pickupLng]}</h1>
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
                  <Button
                    variant="destructive"
                    onClick={() => deleteRequest(r.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          );
        })
        .filter(Boolean)}
    </div>
  );
}

// Helpers
const getDistance = (coord1, coord2) => {
  if (!(Array.isArray(coord1) && Array.isArray(coord2))) return null;

  const R = 6371008.8; // mean radius earth in meters

  const [y1, x1] = coord1,
    [y2, x2] = coord2;
  let dx = x2 - x1,
    dy = y2 - y1;
  let mid = (y1 + y2) / 2;

  // convert to radians
  dx = dx * (Math.PI / 180);
  dy = dy * (Math.PI / 180);
  mid = mid * (Math.PI / 180);

  const x = dx * R * Math.cos(mid);
  const y = dy * R;

  const distMeters = Math.sqrt(x ** 2 + y ** 2);
  console.log(distMeters);

  return distMeters;
};

const calcDistFilter = (dist, filterVal) => {
  // filter value is one of the distance selections
  // IMPORTANT: may become obsolete if slider implemented instead of filter

  switch (filterVal) {
    case "all":
      return true;
    case "1500+": // last selector option
      return dist >= 1500;
    default:
      return dist < parseInt(filterVal, 10);
  }
};

export default RequestsList;
