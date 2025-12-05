import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const HALL_COLORS = {
  "Bruin Plate": "#8e44ad",
  "De Neve": "#2980b9",
  "Epicuria at Covel": "#e67e22",
  Rendezvous: "#16a085",
  "Feast at Rieber": "#c0392b",
  "The Study at Hedrick": "#2c3e50",
};

const DEFAULT_COLOR = "#7f00ff";

export function useRoutesManager() {
  const { user } = useAuth();
  const currentUserId = user?.userId || null;

  // Always initialize as array
  const [routes, setRoutes] = useState([]);

  //
  // ACTIVE DELIVERY: a route where the helperId === current user
  //
  const activeRoute = routes.find(
    (req) =>
      req.request.helperId === currentUserId &&
      req.request.status === "accepted"
  );

  const currentUserHasActiveDelivery = Boolean(activeRoute);
  const currentUserActiveRequest = activeRoute?.request || null;

  //
  // ADD OR UPDATE A ROUTE
  //
  function addRoute(request, polyline, meta = {}) {
    const color = HALL_COLORS[request.pickupLocation] || DEFAULT_COLOR;

    setRoutes((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];

      const existing = safePrev.find((req) => req.id === request.id);

      // UPDATE existing route (important!)
      if (existing) {
        return safePrev.map((req) =>
          req.id === request.id
            ? {
                ...req,
                request,
                polyline: polyline ?? req.polyline,
                distance: meta.distance ?? req.distance,
                duration: meta.duration ?? req.duration,
                color,
              }
            : r
        );
      }

      // ADD new route
      return [
        ...safePrev,
        {
          id: request.id, // must match request.id
          request,
          polyline,
          distance: meta.distance,
          duration: meta.duration,
          color,
          selected: false,
        },
      ];
    });
  }

  //
  // REPLACE ALL ROUTES
  //
  function bulkAddRoutes(list) {
    setRoutes(
      list.map(({ request, polyline, meta }) => ({
        id: request.id,
        request,
        polyline,
        distance: meta?.distance,
        duration: meta?.duration,
        color: HALL_COLORS[request.pickupLocation] || DEFAULT_COLOR,
        selected: false,
      }))
    );
  }

  //
  // SELECT A ROUTE
  //
  function selectRoute(id) {
    setRoutes((prev) =>
      prev.map((req) => ({ ...req, selected: req.id === id }))
    );
  }

  //
  // REMOVE A ROUTE
  //
  function removeRoute(id) {
    setRoutes((prev) => prev.filter((req) => req.id !== id));
  }

  //
  // CLEAR ALL ROUTES
  //
  function clearRoutes() {
    setRoutes([]);
  }

  return {
    routes,
    addRoute,
    bulkAddRoutes,
    selectRoute,
    removeRoute,
    clearRoutes,
    currentUserId,
    currentUserHasActiveDelivery,
    currentUserActiveRequest,
  };
}
