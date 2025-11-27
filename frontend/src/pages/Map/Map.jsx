import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useState, useRef } from "react";
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

const POLLING_RATE = 10000;

// ============ MAIN SCREEN ============

function MapScreen() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [loading, setLoading] = useState(true);
  const routesManager = useRoutesManager();

  // NEW: track logged-in user
  const [currentUserId, setCurrentUserId] = useState(null);

  // Fetch current user ID
  useEffect(() => {
    const fetchUser = async () => {
      const resp = await fetch("/api/user/me", { credentials: "include" });
      if (resp.ok) {
        const data = await resp.json();
        setCurrentUserId(data.userId);
      }
    };
    fetchUser();
  }, []);

  // Load requests + preload routes
  useEffect(() => {
    const fetchRequests = async () => {
      const resp = await fetch("/api/requests");
      const data = await resp.json();
      const list = data.requests || [];
      setRequests(list);

      for (const req of list) {
        if (req.pickupLat && req.dropoffLat) {
          const r = await fetch(
            `/api/directions?from=${req.pickupLat},${req.pickupLng}&to=${req.dropoffLat},${req.dropoffLng}`
          );
          const d = await r.json();
          routesManager.addRoute(req, d.polyline);
        }
      }

      setLoading(false);
    };
    fetchRequests();
  }, []);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(async () => {
      const resp = await fetch("/api/requests");
      const data = await resp.json();
      setRequests(data.requests || []);
    }, POLLING_RATE);

    return () => clearInterval(interval);
  }, []);

  // NEW: detect if helper already has an active delivery
  const currentUserHasActiveDelivery = requests.some(
    (r) => r.status === "accepted" && r.helperId === currentUserId
  );

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

    const remaining = [...tasks];
    const ordered = [];

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

  // ===== RETURN UI =====

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
          loading={loading}
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
        }}
        currentUserId={currentUserId}
        currentUserHasActiveDelivery={currentUserHasActiveDelivery}
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
  loading,
}) {
  async function handleMarkerClick(req) {
    if (selected?.id === req.id) {
      setSelected(null);
      return;
    }

    setSelected(req);
    const resp = await fetch(
      `/api/directions?from=${req.pickupLat},${req.pickupLng}&to=${req.dropoffLat},${req.dropoffLng}`
    );
    const data = await resp.json();

    routesManager.selectRoute(req.id);
  }

  return (
    <MapContainer
      center={[34.0699, -118.4465]}
      zoom={15}
      className="map-container h-full w-full"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <MapBehavior
        routes={routesManager.routes}
        showRoutes={showRoutes}
        selected={selected}
        loading={loading}
      />

      {requests.map((req) => {
        const iconForPickup =
          req.status === "accepted"
            ? acceptedIcon
            : req.status === "completed"
            ? completedIcon
            : pickupIcon;

        return (
          <div key={req.id}>
            {req.pickupLat && (
              <Marker
                position={[req.pickupLat, req.pickupLng]}
                icon={iconForPickup}
                eventHandlers={{ click: () => handleMarkerClick(req) }}
              >
                <Tooltip direction="top">
                  <b>Pickup:</b> {req.pickupLocation}
                </Tooltip>
              </Marker>
            )}

            {routesManager.routes.map((route) => {
              const req = route.request;
              const isSelected = selected?.id === req.id;
              const shouldShow = isSelected || showRoutes;

              if (!shouldShow || !req.dropoffLat) return null;

              return (
                <Marker
                  key={`dropoff-${req.id}`}
                  position={[req.dropoffLat, req.dropoffLng]}
                  icon={dropoffIcon}
                >
                  <Tooltip direction="top">
                    <b>Dropoff:</b> {req.dropoffLocation}
                  </Tooltip>
                </Marker>
              );
            })}
          </div>
        );
      })}

      {routesManager.routes.map((route) => {
        const isSelected = selected?.id === route.id;
        const shouldShow = isSelected || showRoutes;

        if (!shouldShow) return null;

        return (
          <RoutePolyline key={route.id} route={route} highlight={isSelected} />
        );
      })}
    </MapContainer>
  );
}

// ============ MAP BEHAVIOR ============

function MapBehavior({ routes, showRoutes, selected, loading }) {
  const map = useMap();
  const hasBounded = useRef(false);
  const prevSelectedId = useRef(null);

  useEffect(() => {
    if (!routes || routes.length === 0) return;
    if (loading) return;

    let bounds;

    if (selected) {
      const selectedRoute = routes.find(
        (route) => route.request.id === selected.id
      );

      if (selectedRoute) {
        bounds = selectedRoute.polyline;
        map.fitBounds(bounds, { padding: [25, 25] });
        prevSelectedId.current = selected.id;
        return;
      }
    }

    const justDeselected =
      prevSelectedId.current !== null && selected === null;

    if (!hasBounded.current || justDeselected) {
      bounds = getAllBound(routes, showRoutes);
      map.fitBounds(bounds, { padding: [25, 25] });
      hasBounded.current = true;
    }

    prevSelectedId.current = selected?.id || null;
  }, [routes, showRoutes, selected, loading, map]);

  return null;
}

const getAllBound = (routes, showRoutes) => {
  const allPoints = [];
  routes.forEach((route) => {
    const polyline = route.polyline;
    const pickUpCoords = polyline[0];
    const dropOffCoords = polyline[polyline.length - 1];

    if (pickUpCoords) allPoints.push(pickUpCoords);
    if (showRoutes && dropOffCoords) allPoints.push(dropOffCoords);
  });
  return L.latLngBounds(allPoints);
};

export default MapScreen;
