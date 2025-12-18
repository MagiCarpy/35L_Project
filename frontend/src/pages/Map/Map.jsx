import L from "leaflet";
import InfoPanel from "./InfoPanel/InfoPanel";
import RoutePolyline from "../../components/RoutePolyline";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRoutesManager } from "../../hooks/useRoutesManager";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Scan } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClusterCustomIcon } from "../../components/clusterIcon.js";
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
import "../../styles/cluster.css";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const POLLING_RATE = 10000;

function MapScreen() {
  const { authFetch } = useAuth();
  const routesManager = useRoutesManager();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedRoute = location.state;

  const mapRef = useRef(null);
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(selectedRoute || null);
  const [loading, setLoading] = useState(true);
  const [legendOpen, setLegendOpen] = useState(false);

  // refresh every POLLING_RATE ms (passed as prop to InfoPanel)
  const refreshData = async () => {
    const resp = await authFetch("/api/requests");
    const data = await resp.json();
    const list = data.requests || [];
    setRequests(list);

    // Update selected request if new data
    if (selected) {
      const updated = list.find((req) => req.id === selected.id);
      if (updated) {
        setSelected(updated);
        navigate(".", { state: updated, replace: true });
      } else {
        // Clear if deleted
        setSelected(null);
        navigate(".", { state: null, replace: true });
      }
    }
  };

  //
  // POLLING EFFECT — REFRESH REQUEST LIST
  //
  useEffect(() => {
    const interval = setInterval(refreshData, POLLING_RATE);
    return () => clearInterval(interval);
  }, [selected]);

  // EFFECT 1 — LOAD ALL ROUTES ONCE ON MOUNT
  useEffect(() => {
    const loadAllRoutes = async () => {
      setLoading(true);

      const resp = await authFetch("/api/requests");
      const data = await resp.json();
      const list = data.requests || [];
      setRequests(list);

      setLoading(false);
    };

    loadAllRoutes();
  }, []);

  // EFFECT 2 — LOAD ONLY THE SELECTED ROUTE WHEN SELECTED CHANGES
  useEffect(() => {
    const loadSelectedRoute = async () => {
      if (!selected) return;

      const req = requests.find((req) => req.id === selected.id);
      if (!req || !req.pickupLat) return;

      const existing = routesManager.routes.find(
        (request) => request.id === req.id
      );

      // If route exists AND has polyline → just select it (no redraw)
      if (existing && existing.polyline) {
        if (existing.selected) return;

        routesManager.selectRoute(req.id);
        return;
      }

      // Otherwise fetch directions
      const resp = await authFetch(
        `/api/directions?from=${req.pickupLat},${req.pickupLng}&to=${req.dropoffLat},${req.dropoffLng}`
      );
      const data = await resp.json();

      routesManager.addRoute(req, data.polyline, {
        distance: data.distance,
        duration: data.duration,
      });

      const updated = routesManager.routes.find(
        (request) => request.id === req.id
      );
      if (updated?.selected) return;

      routesManager.selectRoute(req.id);
    };

    loadSelectedRoute();
  }, [selected, requests]);

  //
  // MARKER CLICK HANDLER
  //
  // Keep selected route in state, unless cancelled in info panel or deselected.
  async function handleMarkerClick(req) {
    if (selected?.id === req.id) {
      setSelected(null);
      navigate(".", { state: null, replace: true });
      return;
    }
    setSelected(req);
    navigate(".", { state: req, replace: true });
  }

  const resetBounds = async () => {
    if (!mapRef.current || requests.length === 0) return;

    const bounds = getAllBounds(requests); // Assume this can be sync or async
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-[calc(90vh-3.5rem)] relative overflow-hidden p-2 md:p-4 gap-2 md:gap-4">
      {/* LEFT: MAP AREA */}
      <div className="flex-grow relative h-full rounded-xl overflow-hidden shadow-md border border-border">
        {/* Top button (Show Routes) */}
        <div className="absolute z-[1000] top-2.5 left-16 bg-card/90 backdrop-blur rounded-md border border-border shadow-sm active:scale-x-90 active:scale-y-90 transition-transform duration-75">
          <Button
            onClick={() => {
              resetBounds(requests);
              console.log("BOUNDED");
            }}
            className="relative w-8 h-8 dark:bg-card active:scale-x-90 active:scale-y-90 transition-transform duration-75"
          >
            <Scan />
          </Button>
        </div>

        {/* MAP */}
        <MapCore
          requests={requests}
          selected={selected}
          routesManager={routesManager}
          loading={loading}
          handleMarkerClick={handleMarkerClick}
          mapRef={mapRef}
        />

        {/* LEGEND */}
        <div className="absolute top-2.5 right-2.5 z-[1000]">
          <div className="w-44 overflow-hidden rounded-lg border border-border shadow-md bg-white dark:bg-card">
            {/* Legend header */}
            <button
              onClick={() => setLegendOpen((prev) => !prev)}
              className="
                w-full flex items-center justify-between px-3 py-2 
                bg-white dark:bg-card
                hover:bg-gray-100 dark:hover:bg-card/80
                transition
              "
            >
              <span className="font-medium text-foreground dark:text-white text-xs">
                Legend
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  legendOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Legend collapsible */}
            <AnimatePresence initial={false}>
              {legendOpen && (
                <motion.div
                  key="legend-content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-card"
                >
                  <div className="px-3 pb-3 pt-1 space-y-1">
                    <LegendItem color="#377dff" label="Pickup" />
                    <LegendItem color="#ff4d4d" label="Dropoff" />
                    <LegendItem color="#f0c419" label="Accepted" />
                    <LegendItem color="#3ccf4e" label="Completed" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* RIGHT: INFO PANEL */}
      <InfoPanel
        request={selected}
        clearSelection={() => {
          setSelected(null);
          navigate(".", { state: null, replace: true });
        }}
        currentUserHasActiveDelivery={requests.some(
          (req) =>
            req.helperId === routesManager.currentUserId &&
            req.status === "accepted"
        )}
        onRefresh={refreshData}
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
  routesManager,
  handleMarkerClick,
  loading,
  mapRef,
}) {
  return (
    <MapContainer
      center={[34.0699, -118.4465]}
      zoom={15}
      className="map-container h-full w-full"
      ref={mapRef}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <MapBehavior
        routes={routesManager.routes}
        requests={requests}
        selected={selected}
        loading={loading}
      />

      {/* Pickup markers grouped */}
      <MarkerClusterGroup
        chunkedLoading
        polygonOptions={{
          stroke: false,
          fill: false,
        }}
        showCoverageOnHover={false}
        iconCreateFunction={createClusterCustomIcon}
      >
        {/* PICKUP markers */}
        {requests.map((req) => {
          const pickupIconToUse =
            req.status === "accepted"
              ? acceptedIcon
              : req.status === "completed"
              ? completedIcon
              : pickupIcon;

          return (
            req.pickupLat && (
              <Marker
                key={`pickup-${req.id}`}
                position={[req.pickupLat, req.pickupLng]}
                icon={pickupIconToUse}
                type="pickup"
                eventHandlers={{ click: () => handleMarkerClick(req) }}
              >
                <Tooltip>
                  <b>Pickup:</b> {req.pickupLocation}
                </Tooltip>
              </Marker>
            )
          );
        })}

        {/* DROPOFF markers */}
        {requests.map((req) => {
          return (
            req.dropoffLat && (
              <Marker
                key={`dropoff-${req.id}`}
                position={[req.dropoffLat, req.dropoffLng]}
                icon={dropoffIcon}
                type="dropoff"
                eventHandlers={{ click: () => handleMarkerClick(req) }}
              >
                <Tooltip>
                  <b>Dropoff:</b> {req.dropoffLocation}
                </Tooltip>
              </Marker>
            )
          );
        })}
      </MarkerClusterGroup>

      {/* Polylines */}
      {routesManager.routes.map((route) => {
        const isSelected = selected && selected.id === route.id;

        if (!isSelected) return null;

        return (
          <RoutePolyline key={route.id} route={route} highlight={isSelected} />
        );
      })}
    </MapContainer>
  );
}

//
// MapBehavior: handles fitting the map to the selected route
//
function MapBehavior({ routes, requests, selected, loading }) {
  const map = useMap();

  // Track whether user has ever selected a route
  const hasEverSelected = useRef(false);

  useEffect(() => {
    if (selected) {
      hasEverSelected.current = true;
    }
  }, [selected]);

  useEffect(() => {
    if (loading) return;

    // If a route is selected → ALWAYS fit to selected route, and STOP.
    if (selected) {
      const route = routes.find((req) => req.request.id === selected.id);
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

    // FIRST LOAD ONLY — fit to ALL pickup markers
    if (requests.length > 0) {
      const bounds = getAllBounds(requests);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [routes, requests, selected, loading, map]);

  return null;
}

function LegendItem({ color, label }) {
  return (
    <div className="text-xs flex items-center gap-2">
      <span
        className="inline-block w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </div>
  );
}

//
// Compute global bounds
//
function getAllBounds(requests) {
  const points = [];

  requests.forEach((req) => {
    if (req.pickupLat && req.pickupLng) {
      points.push([req.pickupLat, req.pickupLng]);
    }
  });

  return L.latLngBounds(points);
}

export default MapScreen;
