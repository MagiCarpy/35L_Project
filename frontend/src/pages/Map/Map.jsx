import "./Map.css";
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
  const [showRoutes, setShowRoutes] = useState(true);
  const routesManager = useRoutesManager();

  // load all requests & preload routes
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

  // auto-refresh requests every 15 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const resp = await fetch("/api/requests");
      const data = await resp.json();
      setRequests(data.requests || []);
    }, 15000);

    return () => clearInterval(interval);
  }, []);


  // helper multi-stop route
  const loadMyRoute = async () => {
    const resp = await fetch("/api/requests/my-assignments", {
      credentials: "include",
    });
    const data = await resp.json();
    let tasks = data.assignments || [];

    if (tasks.length === 0) {
      routesManager.clearRoutes();
      return;
    }

    // nearest-neighbor ordering on pickup locations
    const remaining = [...tasks];
    const ordered = [];

    // start from first assignment (could be improved later)
    let current = remaining.shift();
    ordered.push(current);
    let currentPoint = {
      lat: current.pickupLat,
      lng: current.pickupLng,
    };

    const distSq = (a, b) =>
      (a.lat - b.lat) * (a.lat - b.lat) +
      (a.lng - b.lng) * (a.lng - b.lng);

    while (remaining.length) {
      let bestIdx = 0;
      let bestDist = Infinity;
      remaining.forEach((req, idx) => {
        const pt = { lat: req.pickupLat, lng: req.pickupLng };
        const d = distSq(currentPoint, pt);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = idx;
        }
      });
      const next = remaining.splice(bestIdx, 1)[0];
      ordered.push(next);
      currentPoint = { lat: next.dropoffLat, lng: next.dropoffLng };
    }

    routesManager.clearRoutes();

    // Fetch directions and build routes in this optimized order
    for (let req of ordered) {
      const r = await fetch(
        `/api/directions?from=${req.pickupLat},${req.pickupLng}&to=${req.dropoffLat},${req.dropoffLng}`
      );
      const d = await r.json();
      routesManager.addRoute(req, d.polyline, {
        distance: d.distance,
        duration: d.duration,
      });
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
            bottom: "10px",
            right: "10px",
            background: "white",
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            display: "flex",
            gap: "8px",
          }}
        >
          <button onClick={loadMyRoute}>Show My Route</button>

          <button onClick={() => setShowRoutes((s) => !s)}>
            {showRoutes ? "Hide Routes" : "Show Routes"}
          </button>
        </div>

        <MapCore
          requests={requests}
          selected={selected}
          setSelected={setSelected}
          routesManager={routesManager}
          showRoutes={showRoutes}
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

function MapCore({ requests, selected, setSelected, routesManager, showRoutes }) {
  async function handleMarkerClick(req) {
    setSelected(req);
    routesManager.clearRoutes();

    const resp = await fetch(
      `/api/directions?from=${req.pickupLat},${req.pickupLng}&to=${req.dropoffLat},${req.dropoffLng}`
    );
    const data = await resp.json();

    routesManager.addRoute(req, data.polyline, {
      distance: data.distance,
      duration: data.duration,
    });
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
      {showRoutes &&
        routesManager.routes.map((route) => (
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
