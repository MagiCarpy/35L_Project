import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "@/context/toastContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config";

const POLLING_RATE = 10000;

function InfoPanel({
  request,
  clearSelection,
  currentUserHasActiveDelivery,
  onRefresh,
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [receiverState, setReceiverState] = useState("pending");
  const [uploadedPhoto, setUploadedPhoto] = useState(
    request?.deliveryPhotoUrl || null
  );
  const navigate = useNavigate();

  const isHelper = user?.userId === request?.helperId;
  const isOwner = user?.userId === request?.userId;

  useEffect(() => {
    const interval = setInterval(onRefresh, POLLING_RATE);
    return () => clearInterval(interval);
  }, [request]);

  useEffect(() => {
    if (!request) {
      setUploadedPhoto(null);
      return;
    }

    fetchReqData();
  }, [request]);

  const fetchReqData = async () => {
    const resp = await fetch(`${API_BASE_URL}/api/requests/${request.id}`, {
      method: "GET",
      credentials: "include",
    });

    if (resp.status === 404) {
      clearSelection();
      return;
    }

    const data = await resp.json();

    if (!data.request) {
      clearSelection();
      return;
    }

    setUploadedPhoto(data.request.deliveryPhotoUrl || null);
    setReceiverState(data.request.receiverConfirmed || "pending");

    request.status = data.request.status;
  };

  if (!request) {
    return (
      <div className="w-full md:w-[300px] bg-muted/30 border border-border p-4 md:p-5 h-1/3 md:h-full flex flex-col justify-center items-center text-center text-muted-foreground rounded-xl">
        <h3 className="text-lg font-semibold mb-2">No request selected</h3>
        <p className="text-sm">Click a marker on the map to view details.</p>
      </div>
    );
  }

  const deleteRequest = async () => {
    const resp = await fetch(`${API_BASE_URL}/api/requests/${request.id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (resp.ok) {
      showToast("Request deleted", "success");
      clearSelection();
    } else {
      showToast("Failed to delete request", "error");
    }
  };

  const acceptRequest = async () => {
    if (!user) {
      showToast("Login to accept requests", "info");
      return navigate("/login");
    }
    const resp = await fetch(
      `${API_BASE_URL}/api/requests/${request.id}/accept`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (!resp.ok) {
      const data = await resp.json();
      showToast(data.message || "Unable to accept request", "error");
    } else {
      showToast("Request accepted!", "success");
      if (onRefresh) onRefresh();
    }
    fetchReqData();
    onRefresh(false);
  };

  const cancelDelivery = async () => {
    const resp = await fetch(
      `${API_BASE_URL}/api/requests/${request.id}/cancel-delivery`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await resp.json();

    if (!resp.ok) {
      showToast(data.message || "Unable to cancel delivery", "error");
      return;
    }

    clearSelection();
    fetchReqData();
    showToast("Delivery canceled", "info");
  };

  const completeDelivery = async () => {
    const resp = await fetch(
      `${API_BASE_URL}/api/requests/${request.id}/complete-delivery`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await resp.json();

    if (!resp.ok) {
      showToast(data.message || "Could not complete delivery", "error");
      return;
    }
    clearSelection();
    showToast("Delivery completed!", "success");
  };

  const confirmReceived = async () => {
    await fetch(`${API_BASE_URL}/api/requests/${request.id}/confirm-received`, {
      method: "POST",
      credentials: "include",
    });
    clearSelection();
    showToast("Delivery confirmed as received!", "success");
  };

  const confirmNotReceived = async () => {
    await fetch(
      `${API_BASE_URL}/api/requests/${request.id}/confirm-not-received`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    clearSelection();
    showToast("Delivery marked as NOT received", "error");
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    let formData = new FormData();
    formData.append("photo", file);

    try {
      const resp = await fetch(
        `${API_BASE_URL}/api/requests/${request.id}/upload-photo`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!resp.ok) {
        console.error("Upload failed. Status code:", resp.status);
        setUploading(false);
        return;
      }

      const data = await resp.json();
      if (data.url) {
        setUploadedPhoto(data.url);
        fetchReqData();

        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full md:w-[300px] bg-card border border-border p-4 md:p-5 md:h-full overflow-y-auto text-card-foreground shadow-md rounded-xl z-20">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold">{request.item}</h2>
        <Button size="icon" onClick={clearSelection} className="h-8 w-8">
          <span className="text-lg">×</span>
        </Button>
      </div>

      {/* Accepted-by-you banner */}
      {isHelper && request.status === "accepted" && (
        <div className="mb-3 px-3 py-2 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
          This is the delivery you accepted
        </div>
      )}

      {/* DETAILS */}
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
                ? "bg-blue-100 text-blue-800"
                : request.status === "accepted"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {request.status}
          </span>
        </div>

        <div>
          <span className="font-semibold block text-xs uppercase text-muted-foreground">
            Requested By
          </span>
          <p>{request.userId}</p>
        </div>

        {request.helperId && (
          <div>
            <span className="font-semibold block text-xs uppercase text-muted-foreground">
              Accepted By
            </span>
            <p>{request.helperId}</p>
          </div>
        )}
      </div>

      {/* DELIVERY PHOTO AREA */}
      {isHelper && request.status === "accepted" && (
        <div className="mt-8 space-y-2">
          <span className="font-semibold block text-xs uppercase text-muted-foreground">
            Delivery Confirmation
          </span>

          {uploadedPhoto ? (
            <img
              src={`${API_BASE_URL}/public/${uploadedPhoto}`}
              alt="Delivery Confirmation"
              className="rounded border w-full"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No photo uploaded yet.
            </p>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={uploading}
            className="text-sm"
          />

          {uploading && <p className="text-xs text-yellow-600">Uploading...</p>}
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="mt-8 space-y-2">
        {/* ACCEPT BUTTON (only for non-owners) */}
        {request.status === "open" && !isOwner && (
          <>
            {currentUserHasActiveDelivery ? (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-600 cursor-not-allowed py-2 rounded"
              >
                You already have an active delivery
              </button>
            ) : (
              <Button
                onClick={acceptRequest}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Accept Request
              </Button>
            )}
          </>
        )}

        {/* Owner view when request is open */}
        {request.status === "open" && isOwner && (
          <p className="mt-2 text-xs text-muted-foreground">
            You created this request. Waiting for someone to accept it.
          </p>
        )}

        {/* DELETE (owner) */}
        {isOwner && (
          <Button
            variant="destructive"
            onClick={deleteRequest}
            className="w-full"
          >
            Delete Request
          </Button>
        )}

        {/* COMPLETE DELIVERY (helper only) */}
        {isHelper && request.status === "accepted" && uploadedPhoto && (
          <Button
            onClick={completeDelivery}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Mark Delivery as Completed
          </Button>
        )}

        {isHelper && request.status === "accepted" && (
          <Button
            onClick={cancelDelivery}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            Cancel Delivery
          </Button>
        )}

        {/* RECEIVER CONFIRMATION */}
        {isOwner && request.status === "completed" && (
          <div className="space-y-2 mt-4">
            {receiverState === "pending" && (
              <>
                <p className="text-sm font-semibold text-muted-foreground">
                  Confirm Delivery
                </p>

                <Button
                  onClick={confirmReceived}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Received
                </Button>

                <Button
                  onClick={confirmNotReceived}
                  variant="destructive"
                  className="w-full"
                >
                  Not Received
                </Button>
              </>
            )}

            {receiverState === "received" && (
              <div className="p-3 rounded bg-green-100 text-green-800 text-sm font-semibold">
                Delivery Confirmed ✔
              </div>
            )}

            {receiverState === "not_received" && (
              <div className="p-3 rounded bg-red-100 text-red-800 text-sm font-semibold">
                Delivery Marked as NOT Received ✘
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default InfoPanel;
