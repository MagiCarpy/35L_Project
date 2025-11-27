import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";

import {
  pickupIcon,
  dropoffIcon,
  acceptedIcon,
  completedIcon,
} from "../../constants/mapIcons";
import { useRoutesManager } from "../../hooks/useRoutesManager";
import RoutePolyline from "../../components/RoutePolyline";
import InfoPanel from "./InfoPanel/InfoPanel";

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
      (a.lat - b.lat) * (a.lat - b.lat) + (a.lng - b.lng) * (a.lng - b.lng);

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
    <div className="flex flex-col md:flex-row w-full h-[calc(100vh-3.5rem)] relative overflow-hidden p-2 md:p-4 gap-2 md:gap-4">
      {/* Map Section */}
      <div className="flex-grow relative h-full rounded-xl overflow-hidden shadow-md border border-border">
        {/* Top Bar */}
        <div className="absolute z-[1000] top-2.5 left-2.5 bg-card/90 backdrop-blur p-2 rounded-md border border-border shadow-sm">
          <Button onClick={() => setShowRoutes((s) => !s)}>
            {showRoutes ? "Hide Routes" : "Show Routes"}
          </Button>
        </div>

        <MapCore
          requests={requests}
          selected={selected}
          setSelected={setSelected}
          routesManager={routesManager}
          showRoutes={showRoutes}
        />

        {/* Legend */}
        <div className="absolute top-2.5 right-2.5 bg-card/90 backdrop-blur p-4 rounded-lg border border-border text-sm leading-relaxed z-[1000] shadow-md text-card-foreground">
          <div className="text-xs flex items-center gap-2">
            <span className="text-[#377dff]">⬤</span> Pickup
          </div>
          <div className="text-xs flex items-center gap-2">
            <span className="text-[#ff4d4d]">⬤</span> Dropoff
          </div>

          <div className="mt-3"></div>

          <div className="text-xs flex items-center gap-2">
            <span className="text-[#f0c419]">⬤</span> Accepted
          </div>
          <div className="text-xs flex items-center gap-2">
            <span className="text-[#3ccf4e]">⬤</span> Completed
          </div>
        </div>
      </div>

      {/* Side Panel */}
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

function MapCore({
  requests,
  selected,
  setSelected,
  routesManager,
  showRoutes,
}) {
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
                <Tooltip direction="top">
                  Dropoff: {req.dropoffLocation}
                </Tooltip>
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

    getAllBound(routes);

    let bounds;
    const active = routes.find((r) => r.selected);
    if (active) bounds = active.polyline.map(([lat, lng]) => [lat, lng]);
    else bounds = getAllBound(routes);
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [routes]);

  return null;
}

const getAllBound = (routes) => {
  const allPoints = [];
  routes.forEach((route) => {
    const polyline = route.polyline;
    const pickUpCoords = polyline[polyline.length - 1];
    const dropOffCoords = polyline[0];

    // FIXME: Change to only pickup when routes visual is fixed
    if (pickUpCoords) allPoints.push(pickUpCoords);
    if (dropOffCoords) allPoints.push(dropOffCoords);
  });
  return L.latLngBounds(allPoints);
};

export default MapScreen;
