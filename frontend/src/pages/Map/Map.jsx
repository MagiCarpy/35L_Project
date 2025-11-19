import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import { pickupIcon, dropoffIcon, acceptedIcon, completedIcon } from "../../constants/mapIcons";
import { Tooltip } from "react-leaflet";
import "./Map.css";
import "leaflet/dist/leaflet.css";


// main wrapper
function MapScreen() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [polyline, setPolyline] = useState(null);

  // fetch reqs on mount
  useEffect(() => {
    const fetchRequests = async () => {
      const resp = await fetch("/api/requests");
      const data = await resp.json();
      setRequests(data.requests || []);
    };
    fetchRequests();
  }, []);

  return (
    <div style={{ display: "flex", width: "100%" }}>
      {/* map section */}
      <div style={{ flexGrow: 1 }}>
        <MapCore
          requests={requests}
          selected={selected}
          setSelected={setSelected}
          polyline={polyline}
          setPolyline={setPolyline}
        />
      </div>

      {/* side pannel */}
      <InfoPanel
        request={selected}
        clearSelection={() => {
          setSelected(null);
          setPolyline(null);
        }}
      />
    </div>
  );
}

// map + markers + polyline
function MapCore({ requests, selected, setSelected, polyline, setPolyline }) {
  // handler for clicking marker
  const handleMarkerClick = async (req) => {
    setSelected(req);

    if (req.pickupLat && req.dropoffLat) {
      const resp = await fetch(
        `/api/directions?from=${req.pickupLat},${req.pickupLng}&to=${req.dropoffLat},${req.dropoffLng}`
      );
      const data = await resp.json();
      setPolyline(data.polyline);
    }
  };

  return (
    <MapContainer
      center={[34.0699, -118.4465]}
      zoom={15}
      className="map-container"
      style={{ height: "90vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* controls zooming when polyline updates */}
      <MapBehavior polyline={polyline} />

      {/* markers for each req */}
      {requests.map((req) => {
        // Pick icon based on status
        const iconForPickup =
          req.status === "accepted"
            ? acceptedIcon
            : req.status === "completed"
            ? completedIcon
            : pickupIcon;

        return (
          <div key={req.id}>
            {/* Pickup marker */}
            {req.pickupLat && (
              <Marker
                position={[req.pickupLat, req.pickupLng]}
                icon={iconForPickup}
                eventHandlers={{
                  click: () => handleMarkerClick(req),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  Pickup: {req.pickupLocation}
                </Tooltip>
              </Marker>
            )}

            {/* Dropoff marker */}
            {req.dropoffLat && (
              <Marker
                position={[req.dropoffLat, req.dropoffLng]}
                icon={dropoffIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(req),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  Dropoff: {req.dropoffLocation}
                </Tooltip>
              </Marker>
            )}
          </div>
        );
      })}

      {/* purple route polyline */}
      {polyline && <Polyline positions={polyline} color="purple" />}
    </MapContainer>
  );
}

// map zoom
function MapBehavior({ polyline }) {
  const map = useMap();

  useEffect(() => {
    if (polyline) {
      const bounds = polyline.map(([lat, lng]) => [lat, lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [polyline]);

  return null;
}

// side panel
function InfoPanel({ request, clearSelection }) {
  if (!request) {
    return (
      <div
        style={{
          width: "300px",
          background: "#f8f8f8",
          borderLeft: "1px solid #ccc",
          padding: "20px",
        }}
      >
        <h3>No request selected</h3>
        <p>Click a marker on the map.</p>
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

  return (
    <div
      style={{
        width: "300px",
        background: "#ffffff",
        borderLeft: "1px solid #ccc",
        padding: "20px",
      }}
    >
      {/* Close Button */}
      <button onClick={clearSelection} style={{ float: "right", fontSize: "18px" }}>
        ×
      </button>

      <h2>{request.item}</h2>

      <p>
        <strong>Pickup:</strong> {request.pickupLocation}
      </p>
      <p>
        <strong>Dropoff:</strong> {request.dropoffLocation}
      </p>
      <p>
        <strong>Status:</strong> {request.status}
      </p>

      {/* Accept button (only shows if open) */}
      {request.status === "open" && (
        <button
          onClick={async () => {
            await fetch(`/api/requests/${request.id}/accept`, {
              method: "POST",
              credentials: "include",
            });
            clearSelection();
            window.location.reload();
          }}
          style={{
            marginTop: "10px",
            padding: "8px 12px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Accept Request
        </button>
      )}

      {/* DELETE button (always available to the creator) */}
      <button
        onClick={deleteRequest}
        style={{
          marginTop: "10px",
          padding: "8px 12px",
          backgroundColor: "#ff4d4d",
          color: "white",
          border: "none",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Delete Request
      </button>
    </div>
  );
}


export default MapScreen;
