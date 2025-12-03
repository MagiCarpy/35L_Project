import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Chat from "../../components/Chat";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config";
import { useToast } from "@/context/toastContext";

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        // We need an endpoint to get a single request.
        // Assuming /api/requests returns all, we might need to filter or add a new endpoint.
        // For now, let's fetch all and find the one we need, or better, add a backend endpoint.
        // Actually, let's try to fetch it directly if the backend supports it, otherwise we'll fetch all.
        // Based on previous file exploration, there is no specific GET /:id for requests in the list I saw?
        // Wait, I didn't verify if GET /api/requests/:id exists.
        // Let's assume we need to fetch all and filter for now to be safe, or I can add the endpoint.
        // But wait, the userController had getUser. requestController likely has getRequest?
        // I'll check requestController in a moment. For now, I'll implement assuming I can fetch it.

        const resp = await fetch(`${API_BASE_URL}/api/requests`, { credentials: "include" });
        if (resp.ok) {
          const data = await resp.json();
          const found = data.requests.find((r) => r.id === id);
          if (found) {
            setRequest(found);
          } else {
            setError("Request not found");
            showToast("Request not found", "error");
          }
        } else {
          setError("Failed to load request");
          showToast("Failed to load request", "error");
        }
      } catch (err) {
        setError("Error loading request");
        showToast("Error loading request", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-destructive">{error}</div>;
  if (!request) return <div className="p-8">Request not found</div>;

  const isParticipant =
    user &&
    (user.userId === request.userId || user.userId === request.helperId);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        &larr; Back
      </Button>

      <div className="bg-card border rounded-lg p-6 mb-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">{request.item}</h1>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="font-semibold text-muted-foreground">Pickup</p>
            <p>{request.pickupLocation}</p>
          </div>
          <div>
            <p className="font-semibold text-muted-foreground">Dropoff</p>
            <p>{request.dropoffLocation}</p>
          </div>
          <div>
            <p className="font-semibold text-muted-foreground">Status</p>
            <p className="capitalize">{request.status}</p>
          </div>
        </div>
      </div>

      {isParticipant ? (
        <div>
          <h2 className="text-xl font-bold mb-4">Chat</h2>
          <Chat requestId={id} />
        </div>
      ) : (
        <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
          You must be the requester or the helper to view the chat.
        </div>
      )}
    </div>
  );
};

export default RequestDetails;
