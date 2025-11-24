import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col md:flex-row w-full h-[calc(100vh-3.5rem)] relative overflow-hidden p-2 md:p-4 gap-2 md:gap-4">
      {/* Map Section */}
      <div className="flex-grow relative h-full rounded-xl overflow-hidden shadow-md border border-border">
        {/* Top Bar */}
        <div className="absolute z-[1000] top-2.5 left-2.5 bg-card/90 backdrop-blur p-2 rounded-md border border-border shadow-sm">
          <Button onClick={loadMyRoute}>Show My Route</Button>
        </div>

        <MapCore
          requests={requests}
          selected={selected}
          setSelected={setSelected}
          routesManager={routesManager}
        />

        {/* Legend */}
        <div className="absolute top-2.5 right-2.5 bg-card/90 backdrop-blur p-4 rounded-lg border border-border text-sm leading-relaxed z-[1000] shadow-md text-card-foreground">
          <div className="flex items-center gap-2"><span className="text-[#377dff]">⬤</span> Pickup</div>
          <div className="flex items-center gap-2"><span className="text-[#ff4d4d]">⬤</span> Dropoff</div>
          <div className="flex items-center gap-2"><span className="text-[#f0c419]">⬤</span> Accepted</div>
          <div className="flex items-center gap-2"><span className="text-[#3ccf4e]">⬤</span> Completed</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="border-b-[3px] border-purple-600 w-8 inline-block"></span> Route
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
      className="map-container h-full w-full"
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
          <span className="font-semibold block text-xs uppercase text-muted-foreground">Pickup</span>
          <p>{request.pickupLocation}</p>
        </div>
        <div>
          <span className="font-semibold block text-xs uppercase text-muted-foreground">Dropoff</span>
          <p>{request.dropoffLocation}</p>
        </div>
        <div>
          <span className="font-semibold block text-xs uppercase text-muted-foreground">Status</span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${request.status === 'open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            request.status === 'accepted' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        {request.status === "open" && (
          <Button onClick={acceptRequest} className="w-full bg-green-600 hover:bg-green-700 text-white">
            Accept Request
          </Button>
        )}

        <Button variant="destructive" onClick={deleteRequest} className="w-full">
          Delete Request
        </Button>
      </div>
    </div>
  );
}

export default MapScreen;
