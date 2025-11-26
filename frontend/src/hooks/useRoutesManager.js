import { useState } from "react";

const HALL_COLORS = {
  "Bruin Plate": "#8e44ad",
  "De Neve": "#2980b9",
  "Epicuria at Covel": "#e67e22",
  "Rendezvous": "#16a085",
  "Feast at Rieber": "#c0392b",
  "The Study at Hedrick": "#2c3e50",
};

const DEFAULT_COLOR = "#7f00ff";

export function useRoutesManager() {
  const [routes, setRoutes] = useState([]);

  function addRoute(request, polyline, meta = {}) {
    const color =
      HALL_COLORS[request.pickupLocation] || DEFAULT_COLOR;

    setRoutes((prev) => {
      const existing = prev.find((r) => r.id === request.id);
      const base = {
        id: request.id,
        request,
        polyline,
        distance: meta.distance,
        duration: meta.duration,
        color,
        selected: false,
      };

      if (existing) {
        return prev.map((r) => (r.id === request.id ? base : r));
      }
      return [...prev, base];
    });
  }

  function bulkAddRoutes(list) {
    setRoutes(
      list.map(({ request, polyline, meta }) => ({
        id: request.id,
        request,
        polyline,
        distance: meta?.distance,
        duration: meta?.duration,
        color:
          HALL_COLORS[request.pickupLocation] || DEFAULT_COLOR,
        selected: false,
      }))
    );
  }

  function selectRoute(id) {
    setRoutes((prev) =>
      prev.map((r) => ({ ...r, selected: r.id === id }))
    );
  }

  function removeRoute(id) {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  }

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
  };
}
