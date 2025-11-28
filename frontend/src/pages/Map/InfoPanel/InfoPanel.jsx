import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";

function InfoPanel({
  request,
  clearSelection,
  currentUserId,
  currentUserHasActiveDelivery,
  onRefresh,   // NEW callback for refreshing parent
}) {
  const { user } = useAuth();

  const [reqUserId, setReqUserId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(request?.deliveryPhotoUrl || null);

  const isHelper = user?.userId === request?.helperId;

  // Fetch fresh request owner ID
  useEffect(() => {
    if (!request) {
      setReqUserId(null);
      setUploadedPhoto(null);
      return;
    }

    const fetchReqData = async () => {
      const resp = await fetch(`/api/requests/${request.id}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await resp.json();
      setReqUserId(data.request.userId);
      setUploadedPhoto(data.request.deliveryPhotoUrl || null);
      request.status = data.request.status;
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

  // Delete request
  const deleteRequest = async () => {
    await fetch(`/api/requests/${request.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    clearSelection();
    window.location.reload();
  };

  // Accept request
  const acceptRequest = async () => {
    const resp = await fetch(`/api/requests/${request.id}/accept`, {
      method: "POST",
      credentials: "include",
    });

    clearSelection();

    if (resp.status !== 200) {
      const data = await resp.json();
      alert(data.message || "Unable to accept request.");
    } else {
      window.location.reload();
    }
  };

  // Upload Delivery Photo
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const resp = await fetch(
        `/api/requests/${request.id}/upload-photo`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await resp.json();

      if (data.url) {
        setUploadedPhoto(data.url);

        // parent refresh callback if provided
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }

    setUploading(false);
  };

  const completeDelivery = async () => {
    const resp = await fetch(`/api/requests/${request.id}/complete-delivery`, {
      method: "POST",
      credentials: "include",
    });

    const data = await resp.json();

    if (resp.status !== 200) {
      alert(data.message || "Could not complete delivery.");
      return;
    }

    // refresh request data
    if (onRefresh) onRefresh();
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

      {/* DETAILS */}
      <div className="space-y-3">
        {/* Pickup */}
        <div>
          <span className="font-semibold block text-xs uppercase text-muted-foreground">
            Pickup
          </span>
          <p>{request.pickupLocation}</p>
        </div>

        {/* Dropoff */}
        <div>
          <span className="font-semibold block text-xs uppercase text-muted-foreground">
            Dropoff
          </span>
          <p>{request.dropoffLocation}</p>
        </div>

        {/* Status */}
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

        {/* Requested By */}
        <div>
          <span className="font-semibold block text-xs uppercase text-muted-foreground">
            Requested By
          </span>
          <p>{reqUserId}</p>
        </div>

        {/* Accepted By */}
        {request.helperId && (
          <div>
            <span className="font-semibold block text-xs uppercase text-muted-foreground">
              Accepted By
            </span>
            <p>{request.helperId}</p>
          </div>
        )}
      </div>

      {/* DELIVERY PHOTO UPLOAD (HELPER ONLY) */}
      {isHelper && request.status === "accepted" && (
        <div className="mt-8 space-y-2">
          <span className="font-semibold block text-xs uppercase text-muted-foreground">
            Delivery Confirmation
          </span>

          {/* Preview */}
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

          {/* File Upload Input */}
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
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="mt-8 space-y-2">

        {/* ACCEPT BUTTON */}
        {request.status === "open" && (
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

        {/* DELETE (owner only) */}
        {user && reqUserId === user.userId && (
          <Button
            variant="destructive"
            onClick={deleteRequest}
            className="w-full"
          >
            Delete Request
          </Button>
        )}

        {/* COMPLETE DELIVERY (helper only, after photo upload) */}
        {isHelper &&
          request.status === "accepted" &&
          uploadedPhoto && (
            <Button
              onClick={completeDelivery}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Mark Delivery as Completed
            </Button>
        )}
      </div>
    </div>
  );
}

export default InfoPanel;
