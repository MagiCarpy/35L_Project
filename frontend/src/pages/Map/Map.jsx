import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRoutesManager } from "../../hooks/useRoutesManager";
import { useLocation } from "react-router-dom";
import RoutePolyline from "../../components/RoutePolyline";
import InfoPanel from "./InfoPanel/InfoPanel";
import L from "leaflet";
import { Eye, EyeOff } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MarkerClusterGroup from "react-leaflet-cluster";   // ⭐ FIX HERE
import { createClusterCustomIcon } from "../../components/clusterIcon.js";
import "../../styles/cluster.css";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
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
  const [legendOpen, setLegendOpen] = useState(false);

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

      {/* LEFT: MAP AREA */}
      <div className="flex-grow relative h-full rounded-xl overflow-hidden shadow-md border border-border">

        {/* Top button (Show Routes) */}
        <div className="absolute z-[1000] top-2.5 left-16 bg-card/90 backdrop-blur p-2 rounded-md border border-border shadow-sm">
          <Button onClick={() => setShowRoutes((s) => !s)} className="relative w-8 h-8">
            <AnimatePresence mode="wait" initial={false}>
              {showRoutes ? (
                <motion.div
                  key="off"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <EyeOff className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="on"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Eye className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>

        {/* MAP */}
        <MapCore
          requests={requests}
          selected={selected}
          setSelected={setSelected}
          showRoutes={showRoutes}
          routesManager={routesManager}
          loading={loading}
          handleMarkerClick={handleMarkerClick}
        />

        {/* LEGEND */}
        <div className="absolute top-2.5 right-2.5 z-[1000]">
          <div
            className="w-44 overflow-hidden rounded-lg border border-border shadow-md bg-white dark:bg-card"
          >
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


export default MapScreen;
