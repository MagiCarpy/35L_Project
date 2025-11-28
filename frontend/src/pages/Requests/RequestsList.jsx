import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function RequestsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userPos, setUserPos] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filterBy, setFilterBy] = useState("all");
  const [appliedFilter, setAppliedFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const activeDelivery = requests.find(
    (r) => r.helperId === user?.userId && r.status === "accepted"
  );
  const userIsBusy = Boolean(activeDelivery);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  const fetchRequests = async () => {
    const resp = await fetch("/api/requests", {
      credentials: "include",
    });
    const data = await resp.json();
    setRequests(data.requests || []);
    setLoading(false);
  };

  const acceptRequest = async (id) => {
    await fetch(`/api/requests/${id}/accept`, {
      method: "POST",
      credentials: "include",
    });
    fetchRequests();
  };

  const deleteRequest = async (id) => {
    await fetch(`/api/requests/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApplyFilter = () => {
    setAppliedFilter(filterBy);
  };

  const handleViewRoute = (selectedRoute) => {
    navigate("/home", { state: selectedRoute });
  };

  if (loading) return <p className="p-5">Getting Requests...</p>;

  return (
    <div className="p-5">
      <h2 className="text-3xl font-bold mb-6">Requests</h2>

      {/* Active delivery banner */}
      {userIsBusy && activeDelivery && (
        <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800 text-sm font-medium">
          You currently have an active delivery:{" "}
          <span className="font-semibold">
            {activeDelivery.item} ({activeDelivery.pickupLocation} →{" "}
            {activeDelivery.dropoffLocation})
          </span>
        </div>
      )}

      {/* FILTER SECTION */}
      <div className="mb-8 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full max-w-md">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2.5 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Requests</option>
            <option value="50">Less than 50 meters</option>
            <option value="100">Less than 100 meters</option>
            <option value="200">Less than 200 meters</option>
            <option value="300">Less than 300 meters</option>
            <option value="500">Less than 500 meters</option>
            <option value="700">Less than 700 meters</option>
            <option value="1000">Less than 1000 meters</option>
            <option value="1500">Less than 1500 meters</option>
            <option value="1500+">1500+ meters</option>
          </select>

          <Button
            onClick={handleApplyFilter}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 whitespace-nowrap"
            disabled={filterBy === appliedFilter}
          >
            Apply Filter
          </Button>
        </div>

        {appliedFilter !== "all" && (
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span>Active:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
              {appliedFilter === "1500+"
                ? "1500+ meters"
                : `< ${appliedFilter} meters`}
            </span>
            <button
              onClick={() => {
                setFilterBy("all");
                setAppliedFilter("all");
              }}
              className="text-white hover:underline text-sm"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {requests.length === 0 && (
        <p className="text-gray-600">No requests yet.</p>
      )}

      {requests
        .map((r) => {
          const pickup = [r.pickupLat, r.pickupLng];
          const dist = getDistance(userPos, pickup);
          const show = calcDistFilter(dist, appliedFilter);
          if (!show) return null;

          const isAcceptedByUser =
            userIsBusy && activeDelivery && activeDelivery.id === r.id;

          // COMPUTED STATUS LABELS
          let statusLabel = r.status;

          if (r.status === "completed") {
            if (r.receiverConfirmed === "received") {
              statusLabel = "Completed — Received ✔";
            } else if (r.receiverConfirmed === "not_received") {
              statusLabel = "Completed — Not Received ✘";
            } else {
              statusLabel = "Completed — Awaiting Confirmation";
            }
          }

          return (
            <div
              key={r.id}
              className="border border-border p-5 mb-4 rounded-lg shadow-sm bg-card text-card-foreground hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl text-shadow-outline">
                  {r.item}
                </h3>
                {dist !== null && (
                  <span className="text-xs text-grey-500">
                    <b>Distance:</b> <br />~{Math.round(dist)} m
                  </span>
                )}
              </div>

              {/* DETAILS */}
              <div className="text-sm">
                <p>
                  <strong>Pickup:</strong> {r.pickupLocation}
                </p>
                <p>
                  <strong>Dropoff:</strong> {r.dropoffLocation}
                </p>

                {/* STATUS */}
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="capitalize font-medium">
                    {statusLabel}
                  </span>
                </p>

                {/* Accepted banner */}
                {isAcceptedByUser && (
                  <p className="mt-1 text-xs font-semibold text-blue-700">
                    You accepted this request
                  </p>
                )}

                {/* Receiver confirmation badges */}
                {r.receiverConfirmed === "received" && (
                  <div className="mt-2 p-2 rounded bg-green-100 text-green-800 text-xs font-semibold w-fit">
                    Delivery Confirmed ✔
                  </div>
                )}

                {r.receiverConfirmed === "not_received" && (
                  <div className="mt-2 p-2 rounded bg-red-100 text-red-800 text-xs font-semibold w-fit">
                    Delivery Marked as NOT Received ✘
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-4 flex gap-3">
                {user &&
                  r.userId !== user.userId &&
                  r.status === "open" &&
                  (userIsBusy ? (
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
                  ))}

                {r.userId === user.userId && (
                  <Button
                    variant="destructive"
                    onClick={() => deleteRequest(r.id)}
                  >
                    Delete Request
                  </Button>
                )}

                <Button onClick={() => handleViewRoute(r)}>
                  View Route
                </Button>
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
  const R = 6371008.8;
  const [y1, x1] = coord1,
    [y2, x2] = coord2;
  let dx = x2 - x1,
    dy = y2 - y1;
  let mid = (y1 + y2) / 2;

  dx = dx * (Math.PI / 180);
  dy = dy * (Math.PI / 180);
  mid = mid * (Math.PI / 180);

  const x = dx * R * Math.cos(mid);
  const y = dy * R;
  return Math.sqrt(x ** 2 + y ** 2);
};

const calcDistFilter = (dist, filterVal) => {
  if (!dist) return true;
  switch (filterVal) {
    case "all":
      return true;
    case "1500+":
      return dist >= 1500;
    default:
      return dist < parseInt(filterVal, 10);
  }
};

export default RequestsList;
