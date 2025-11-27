import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";

function InfoPanel({ request, clearSelection }) {
  const { user } = useAuth();
  const [reqUserId, setReqUserId] = useState(null);

  useEffect(() => {
    if (!request) {
      setReqUserId(null);
      return;
    }

    const fetchReqData = async () => {
      try {
        const data = await getRequest();
        setReqUserId(data.userId);
      } catch (error) {
        console.error("Error getting request data:", error);
      }
    };

    fetchReqData();
  }, [request]); // run whenever request is selected to get the its associated userId

  if (!request) {
    return (
      <div className="w-full md:w-[300px] bg-muted/30 border border-border p-4 md:p-5 h-1/3 md:h-full flex flex-col justify-center items-center text-center text-muted-foreground rounded-xl">
        <h3 className="text-lg font-semibold mb-2">No request selected</h3>
        <p className="text-sm">Click a marker on the map to view details.</p>
      </div>
    );
  }

  const deleteRequest = async () => {
    await fetch(`/api/requests/${request.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    clearSelection();
    window.location.reload();
  };

  const acceptRequest = async () => {
    await fetch(`/api/requests/${request.id}/accept`, {
      method: "POST",
      credentials: "include",
    });
    clearSelection();
    window.location.reload();
  };

  const getRequest = async () => {
    const resp = await fetch(`/api/requests/${request.id}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await resp.json();
    const requestData = data.request;

    return requestData;
  };

  return (
    <div className="w-full md:w-[300px] bg-card border border-border p-4 md:p-5 h-1/3 md:h-full overflow-y-auto text-card-foreground shadow-md rounded-xl z-20">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold">{request.item}</h2>
        <Button size="icon" onClick={clearSelection} className="h-8 w-8">
          <span className="text-lg">×</span>
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <span className="font-semibold block text-xs uppercase text-muted-foreground">
            Pickup
          </span>
          <p>{request.pickupLocation}</p>
        </div>
        <div>
          <span className="font-semibold block text-xs uppercase text-muted-foreground">
            Dropoff
          </span>
          <p>{request.dropoffLocation}</p>
        </div>
        <div>
          <span className="font-semibold block text-xs uppercase text-muted-foreground">
            Status
          </span>
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              request.status === "open"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : request.status === "accepted"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            }`}
          >
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        {user && reqUserId !== user.userId && request.status === "open" && (
          <Button
            onClick={acceptRequest}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Accept Request
          </Button>
        )}

        {user && reqUserId === user.userId && (
          <Button
            variant="destructive"
            onClick={deleteRequest}
            className="w-full"
          >
            Delete Request
          </Button>
        )}
      </div>
    </div>
  );
}

export default InfoPanel;
