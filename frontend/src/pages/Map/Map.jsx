import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRoutesManager } from "../../hooks/useRoutesManager";
import { useLocation } from "react-router-dom";
import RoutePolyline from "../../components/RoutePolyline";
import InfoPanel from "./InfoPanel/InfoPanel";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import {
  pickupIcon,
  dropoffIcon,
  acceptedIcon,
  completedIcon,
} from "../../constants/mapIcons";

const POLLING_RATE = 10000;

function MapScreen() {
  const routesManager = useRoutesManager();
  const location = useLocation();
  const selectedRoute = location.state;
  const hasInit = useRef(false);

  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(selectedRoute || null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [loading, setLoading] = useState(true);

  // EFFECT 1 — LOAD ALL ROUTES ONCE ON MOUNT
  useEffect(() => {
    const loadAllRoutes = async () => {
      setLoading(true);

      const resp = await fetch("/api/requests");
      const data = await resp.json();
      const list = data.requests || [];
      setRequests(list);

      // Only preload all routes ONCE
      if (!hasInit.current) {
        for (const req of list) {
          if (!req.pickupLat || !req.dropoffLat) continue;

          const r = await fetch(
            `/api/directions?from=${req.pickupLat},${req.pickupLng}&to=${req.dropoffLat},${req.dropoffLng}`
          );
          const d = await r.json();

          routesManager.addRoute(req, d.polyline, {
            distance: d.distance,
            duration: d.duration,
          });
        }
        hasInit.current = true;
      }

      setLoading(false);
    };

    loadAllRoutes();
  }, []);

  // EFFECT 2 — LOAD ONLY THE SELECTED ROUTE WHEN SELECTED CHANGES
  useEffect(() => {
    const loadSelectedRoute = async () => {
      if (!selected) return;

      const req = requests.find((r) => r.id === selected.id);
      if (!req || !req.pickupLat) return;

      const existing = routesManager.routes.find((r) => r.id === req.id);

      // If route exists AND has polyline → just select it (no redraw)
      if (existing && existing.polyline) {

        if (existing.selected) return;

        routesManager.selectRoute(req.id);
        return;
      }

      // Otherwise fetch directions
      const r = await fetch(
        `/api/directions?from=${req.pickupLat},${req.pickupLng}&to=${req.dropoffLat},${req.dropoffLng}`
      );
      const d = await r.json();

      routesManager.addRoute(req, d.polyline, {
        distance: d.distance,
        duration: d.duration,
      });

      const updated = routesManager.routes.find((r) => r.id === req.id);
      if (updated?.selected) return;

      routesManager.selectRoute(req.id);
    };

    loadSelectedRoute();
  }, [selected]);



  //
  // POLLING EFFECT — REFRESH REQUEST LIST
  //
  useEffect(() => {
    const interval = setInterval(async () => {
      const resp = await fetch("/api/requests");
      const data = await resp.json();
      setRequests(data.requests || []);
    }, POLLING_RATE);

    return () => clearInterval(interval);
  }, []);

  //
  // MARKER CLICK HANDLER
  //
  async function handleMarkerClick(req) {
    if (selected?.id === req.id) {
      setSelected(null);
      return;
    }
    setSelected(req);
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-[calc(100vh-3.5rem)] relative overflow-hidden p-2 md:p-4 gap-2 md:gap-4">
      {/* Map Container */}
      <div className="flex-grow relative h-full rounded-xl overflow-hidden shadow-md border border-border">
        {/* Top button */}
        <div className="absolute z-[1000] top-2.5 left-2.5 bg-card/90 backdrop-blur p-2 rounded-md border border-border shadow-sm">
          <Button onClick={() => setShowRoutes((s) => !s)}>
            {showRoutes ? "Hide Routes" : "Show Routes"}
          </Button>
        </div>

        <MapCore
          requests={requests}
          selected={selected}
          setSelected={setSelected}
          showRoutes={showRoutes}
          routesManager={routesManager}
          loading={loading}
          handleMarkerClick={handleMarkerClick}
        />

        {/* Legend */}
        <div className="absolute top-2.5 right-2.5 bg-card/90 backdrop-blur p-4 rounded-lg border border-border text-sm leading-relaxed z-[1000] shadow-md text-card-foreground">
          <div className="text-xs flex items-center gap-2">
            <span className="text-[#377dff]">⬤</span> Pickup
          </div>
          <div className="text-xs flex items-center gap-2">
            <span className="text-[#ff4d4d]">⬤</span> Dropoff
          </div>
          <div className="mt-3" />
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
        clearSelection={() => setSelected(null)}
        currentUserId={routesManager.currentUserId}
        currentUserHasActiveDelivery={routesManager.currentUserHasActiveDelivery}
        onRefresh={async () => {
          const resp = await fetch("/api/requests");
          const data = await resp.json();
          setRequests(data.requests || []);
        }}
      />
    </div>
  );
}

//
// MapCore: handles markers, polylines, and map behaviors
//
function MapCore({
  requests,
  selected,
  setSelected,
  showRoutes,
  routesManager,
  handleMarkerClick,
  loading,
}) {

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
        const icon =
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
                icon={icon}
                eventHandlers={{ click: () => handleMarkerClick(req) }}
              >
                <Tooltip>
                  <b>Pickup:</b> {req.pickupLocation}
                </Tooltip>
              </Marker>
            )}

            {/* Dropoff marker for selected or showRoutes */}
            {routesManager.routes.map((route) => {
              const rReq = route.request;
              const shouldShow =
                showRoutes || selected?.id === rReq.id;
              if (!shouldShow || !rReq.dropoffLat) return null;

              return (
                <Marker
                  key={`drop-${rReq.id}`}
                  position={[rReq.dropoffLat, rReq.dropoffLng]}
                  icon={dropoffIcon}
                >
                  <Tooltip>
                    <b>Dropoff:</b> {rReq.dropoffLocation}
                  </Tooltip>
                </Marker>
              );
            })}
          </div>
        );
      })}

      {/* Polylines */}
      {routesManager.routes.map((route) => {
        const isSelected = selected?.id === route.id;
        const shouldShow = isSelected || showRoutes;
        if (!shouldShow) return null;

        return (
          <RoutePolyline
            key={route.id}
            route={route}
            highlight={isSelected}
          />
        );
      })}
    </MapContainer>
  );
}

//
// MapBehavior: handles fitting the map to the selected route
//
function MapBehavior({ routes, showRoutes, selected, loading }) {
  const map = useMap();

  // Track whether user has ever selected a route
  const hasEverSelected = useRef(false);

  useEffect(() => {
    if (selected) {
      hasEverSelected.current = true;
    }
  }, [selected]);

  useEffect(() => {
    if (loading || routes.length === 0) return;

    // If a route is selected → ALWAYS fit to selected route, and STOP.
    if (selected) {
      const route = routes.find((r) => r.request.id === selected.id);
      if (route && route.polyline) {
        map.fitBounds(route.polyline, { padding: [50, 50] });
      }
      return;
    }

    // If we have EVER selected a route before → DO NOT fit to all routes again.
    // This is the fix that prevents the flicker.
    if (hasEverSelected.current) {
      return;
    }

    // FIRST LOAD ONLY — fit to ALL routes
    const bounds = getAllBounds(routes, showRoutes);
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routes, showRoutes, selected, loading, map]);

  return null;
}


//
// Compute global bounds
//
function getAllBounds(routes, showRoutes) {
  const points = [];

  routes.forEach((route) => {
    const poly = route.polyline;
    if (!poly) return;

    const pickup = poly[0];
    const dropoff = poly[poly.length - 1];

    if (pickup) points.push(pickup);
    if (showRoutes && dropoff) points.push(dropoff);
  });

  return L.latLngBounds(points);
}

export default MapScreen;
