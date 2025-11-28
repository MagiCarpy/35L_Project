import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";

function InfoPanel({
  request,
  clearSelection,
  currentUserHasActiveDelivery,
  onRefresh,
}) {
  const { user } = useAuth();

  const [reqUserId, setReqUserId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(
    request?.deliveryPhotoUrl || null
  );
  const [status, setStatus] = useState(request?.status || "open");

  const isHelper = user?.userId && request?.helperId === user.userId;
  const isOwner = user?.userId && request?.userId === user.userId;

  useEffect(() => {
    if (!request) {
      setReqUserId(null);
      setUploadedPhoto(null);
      setStatus("open");
      return;
    }

    const fetchReqData = async () => {
      const resp = await fetch(`/api/requests/${request.id}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await resp.json();
      const r = data.request;
      setReqUserId(r.userId);
      setUploadedPhoto(r.deliveryPhotoUrl || null);
      setStatus(r.status);
    };

    fetchReqData();
  }, [request]);

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
    if (onRefresh) onRefresh();
  };

  const acceptRequest = async () => {
    const resp = await fetch(`/api/requests/${request.id}/accept`, {
      method: "POST",
      credentials: "include",
    });

    if (resp.status !== 200) {
      const data = await resp.json();
      alert(data.message || "Unable to accept request.");
    }

    if (onRefresh) onRefresh();
    clearSelection();
  };

  const startDelivery = async () => {
    const resp = await fetch(`/api/requests/${request.id}/start-delivery`, {
      method: "POST",
      credentials: "include",
    });
    const data = await resp.json();
    if (resp.ok) {
      setStatus(data.request.status);
      if (onRefresh) onRefresh();
    } else {
      alert(data.message || "Unable to start delivery.");
    }
  };

  const cancelHelper = async () => {
    const resp = await fetch(`/api/requests/${request.id}/cancel-helper`, {
      method: "POST",
      credentials: "include",
    });
    const data = await resp.json();
    if (resp.ok) {
      if (onRefresh) onRefresh();
      clearSelection();
    } else {
      alert(data.message || "Unable to cancel delivery.");
    }
  };

  const cancelRequester = async () => {
    const resp = await fetch(
      `/api/requests/${request.id}/cancel-requester`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    const data = await resp.json();
    if (resp.ok) {
      if (onRefresh) onRefresh();
      clearSelection();
    } else {
      alert(data.message || "Unable to cancel request.");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const resp = await fetch(`/api/requests/${request.id}/upload-photo`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await resp.json();
      if (data.url) {
        setUploadedPhoto(data.url);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }

    setUploading(false);
  };

  const completeDelivery = async () => {
    const resp = await fetch(
      `/api/requests/${request.id}/complete-delivery`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    const data = await resp.json();

    if (!resp.ok) {
      alert(data.message || "Could not complete delivery.");
      return;
    }

    setStatus(data.request.status);
    if (onRefresh) onRefresh();
  };

  const confirmReceived = async () => {
    const resp = await fetch(
      `/api/requests/${request.id}/confirm-received`,
      { method: "POST", credentials: "include" }
    );
    const data = await resp.json();

    if (!resp.ok) {
      alert(data.message || "Could not confirm as received.");
      return;
    }
    if (onRefresh) await onRefresh();

    clearSelection();
  };


  const confirmNotReceived = async () => {
    const resp = await fetch(
      `/api/requests/${request.id}/confirm-not-received`,
      { method: "POST", credentials: "include" }
    );
    const data = await resp.json();

    if (!resp.ok) {
      alert(data.message || "Could not mark as not received.");
      return;
    }

    if (onRefresh) await onRefresh();
    clearSelection();
  };


  const renderStatusBadge = () => {
    let label = status;
    let classes =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ";

    switch (status) {
      case "open":
        label = "Open";
        classes += "bg-blue-100 text-blue-800";
        break;
      case "accepted":
        label = "Accepted";
        classes += "bg-yellow-100 text-yellow-800";
        break;
      case "in_delivery":
        label = "In Delivery";
        classes += "bg-purple-100 text-purple-800";
        break;
      case "completed":
        label = "Completed (awaiting confirmation)";
        classes += "bg-indigo-100 text-indigo-800";
        break;
      case "received":
        label = "Received ✔";
        classes += "bg-green-100 text-green-800";
        break;
      case "not_received":
        label = "Not Received ✘";
        classes += "bg-red-100 text-red-800";
        break;
      default:
        classes += "bg-gray-100 text-gray-800";
    }

    return <span className={classes}>{label}</span>;
  };

  return (
    <div className="w-full md:w-[300px] bg-card border border-border p-4 md:p-5 h-1/3 md:h-full overflow-y-auto text-card-foreground shadow-md rounded-xl z-20">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold">{request.item}</h2>
        <Button size="icon" onClick={clearSelection} className="h-8 w-8">
          <span className="text-lg">×</span>
        </Button>
      </div>

      {/* Special banners */}
      {isHelper && ["accepted", "in_delivery"].includes(status) && (
        <div className="mb-3 px-3 py-2 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
          This is the delivery you accepted
        </div>
      )}

      {isOwner && status === "open" && (
        <div className="mb-3 px-3 py-2 rounded bg-yellow-50 text-yellow-800 text-xs font-semibold">
          You created this request. Waiting for someone to accept it.
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
          {renderStatusBadge()}
        </div>
        <div>
          <span className="font-semibold block text-xs uppercase text-muted-foreground">
            Requested By
          </span>
          <p>{reqUserId}</p>
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

      {/* DELIVERY PHOTO AREA (helper view) */}
      {isHelper && ["accepted", "in_delivery", "completed"].includes(status) && (
        <div className="mt-8 space-y-2">
          <span className="font-semibold block text-xs uppercase text-muted-foreground">
            Delivery Confirmation Photo
          </span>

          {uploadedPhoto ? (
            <img
              src={`http://localhost:5000${uploadedPhoto}`}
              alt="Delivery Confirmation"
              className="rounded border w-full"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No photo uploaded yet.
            </p>
          )}

          {["accepted", "in_delivery", "completed"].includes(status) && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="text-sm"
              />
              {uploading && (
                <p className="text-xs text-yellow-600">Uploading...</p>
              )}
            </>
          )}
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="mt-8 space-y-2">
        {/* OPEN: Accept / Cancel */}
        {status === "open" && !isOwner && (
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

        {status === "open" && isOwner && (
          <Button
            variant="destructive"
            onClick={cancelRequester}
            className="w-full"
          >
            Cancel Request
          </Button>
        )}

        {/* ACCEPTED: Helper can Start or Cancel */}
        {isHelper && status === "accepted" && (
          <>
            <Button
              onClick={startDelivery}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start Delivery
            </Button>
            <Button
              onClick={cancelHelper}
              variant="outline"
              className="w-full"
            >
              Cancel Delivery
            </Button>
          </>
        )}

        {/* IN_DELIVERY: Helper can Complete or Cancel */}
        {isHelper && status === "in_delivery" && (
          <>
            <Button
              onClick={completeDelivery}
              disabled={!uploadedPhoto}
              className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:text-gray-600"
            >
              Mark Delivery as Completed
            </Button>
            <Button
              onClick={cancelHelper}
              variant="outline"
              className="w-full"
            >
              Cancel Delivery
            </Button>
          </>
        )}

        {/* COMPLETED: Requester confirmation */}
        {isOwner && status === "completed" && (
          <div className="space-y-2 mt-4">
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
          </div>
        )}

        {/* Final states info */}
        {status === "received" && (
          <div className="mt-4 p-3 rounded bg-green-100 text-green-800 text-sm font-semibold">
            Delivery Completed ✔
          </div>
        )}

        {status === "not_received" && (
          <div className="mt-4 p-3 rounded bg-red-100 text-red-800 text-sm font-semibold">
            Delivery marked as NOT received ✘
          </div>
        )}
      </div>
    </div>
  );
}

export default InfoPanel;
