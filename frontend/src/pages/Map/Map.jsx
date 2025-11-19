import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

import { pickupIcon, dropoffIcon, acceptedIcon, completedIcon } from "../../constants/mapIcons";
import { useRoutesManager } from "../../hooks/useRoutesManager";
import RoutePolyline from "../../components/RoutePolyline";

// ============ MAIN SCREEN ============

function MapScreen() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const routesManager = useRoutesManager();

  // Load all requests & preload routes
  useEffect(() => {
    const fetchRequests = async () => {
      const resp = await fetch("/api/requests");
      const data = await resp.json();
      const list = data.requests || [];
      setRequests(list);

      // Pre-load directions for ALL open requests
      for (const req of list) {
        if (req.pickupLat && req.dropoffLat) {
          const r = await fetch(
            `/api/directions?from=${req.pickupLat},${req.pickupLng}&to=${req.dropoffLat},${req.dropoffLng}`
          );
          const d = await r.json();
          routesManager.addRoute(req, d.polyline);
        }
      }
    };
    fetchRequests();
  }, []);

  // Helper multi-stop route
  const loadMyRoute = async () => {
    const resp = await fetch("/api/requests/my-assignments", { credentials: "include" });
    const data = await resp.json();
    const tasks = data.assignments;

    routesManager.clearRoutes();

    for (let req of tasks) {
      const r = await fetch(
        `/api/directions?from=${req.pickupLat},${req.pickupLng}&to=${req.dropoffLat},${req.dropoffLng}`
      );
      const d = await r.json();
      routesManager.addRoute(req, d.polyline);
    }
  };

  return (
    <div style={{ display: "flex", width: "100%" }}>
      {/* Map Section */}
      <div style={{ flexGrow: 1, position: "relative" }}>
        {/* Top Bar */}
        <div
          style={{
            position: "absolute",
            zIndex: 1000,
            top: "10px",
            left: "10px",
            background: "white",
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          <button onClick={loadMyRoute}>Show My Route</button>
        </div>

        <MapCore
          requests={requests}
          selected={selected}
          setSelected={setSelected}
          routesManager={routesManager}
        />

        {/* Legend */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "white",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
            lineHeight: "1.6",
            zIndex: 1000,
          }}
        >
          <div><span style={{ color: "#377dff" }}>⬤</span> Pickup</div>
          <div><span style={{ color: "#ff4d4d" }}>⬤</span> Dropoff</div>
          <div><span style={{ color: "#f0c419" }}>⬤</span> Accepted</div>
          <div><span style={{ color: "#3ccf4e" }}>⬤</span> Completed</div>
          <div style={{ marginTop: "8px" }}>
            <span style={{ borderBottom: "3px solid purple" }}>____</span> Route
          </div>
        </div>
      </div>

      {/* Panel */}
      <InfoPanel
        request={selected}
        clearSelection={() => {
          setSelected(null);
          routesManager.clearRoutes();
        }}
      />
    </div>
  );
}

// ============ MAP CORE ============

function MapCore({ requests, selected, setSelected, routesManager }) {
  async function handleMarkerClick(req) {
    setSelected(req);
    routesManager.clearRoutes();

    const resp = await fetch(
      `/api/directions?from=${req.pickupLat},${req.pickupLng}&to=${req.dropoffLat},${req.dropoffLng}`
    );
    const data = await resp.json();

    routesManager.addRoute(req, data.polyline);
    routesManager.selectRoute(req.id);
  }

  return (
    <MapContainer
      center={[34.0699, -118.4465]}
      zoom={15}
      className="map-container"
      style={{ height: "90vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <MapBehavior routes={routesManager.routes} />

      {/* All request markers */}
      {requests.map((req) => {
        const iconForPickup =
          req.status === "accepted"
            ? acceptedIcon
            : req.status === "completed"
            ? completedIcon
            : pickupIcon;

        return (
          <div key={req.id}>
            {/* Pickup Marker */}
            {req.pickupLat && (
              <Marker
                position={[req.pickupLat, req.pickupLng]}
                icon={iconForPickup}
                eventHandlers={{ click: () => handleMarkerClick(req) }}
              >
                <Tooltip direction="top">Pickup: {req.pickupLocation}</Tooltip>
              </Marker>
            )}

            {/* Dropoff Marker */}
            {req.dropoffLat && (
              <Marker
                position={[req.dropoffLat, req.dropoffLng]}
                icon={dropoffIcon}
                eventHandlers={{ click: () => handleMarkerClick(req) }}
              >
                <Tooltip direction="top">Dropoff: {req.dropoffLocation}</Tooltip>
              </Marker>
            )}
          </div>
        );
      })}

      {/* All routes */}
      {routesManager.routes.map((route) => (
        <RoutePolyline key={route.id} route={route} />
      ))}
    </MapContainer>
  );
}

// ============ MAP BEHAVIOR ============

function MapBehavior({ routes }) {
  const map = useMap();

  useEffect(() => {
    if (!routes || routes.length === 0) return;

    const active = routes.find((r) => r.selected) || routes[0];

    const bounds = active.polyline.map(([lat, lng]) => [lat, lng]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [routes]);

  return null;
}

// ============ INFO PANEL ============

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

  const acceptRequest = async () => {
    await fetch(`/api/requests/${request.id}/accept`, {
      method: "POST",
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
      <button onClick={clearSelection} style={{ float: "right", fontSize: "20px" }}>
        ×
      </button>

      <h2>{request.item}</h2>

      <p><strong>Pickup:</strong> {request.pickupLocation}</p>
      <p><strong>Dropoff:</strong> {request.dropoffLocation}</p>
      <p><strong>Status:</strong> {request.status}</p>

      {request.status === "open" && (
        <button
          onClick={acceptRequest}
          style={{
            marginTop: "10px",
            padding: "8px 12px",
            width: "100%",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Accept Request
        </button>
      )}

      <button
        onClick={deleteRequest}
        style={{
          marginTop: "10px",
          padding: "8px 12px",
          width: "100%",
          backgroundColor: "#ff4d4d",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Delete Request
      </button>
    </div>
  );
}

export default MapScreen;
