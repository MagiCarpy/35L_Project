import { useState } from "react";

export function useRoutesManager() {
  const [routes, setRoutes] = useState([]);

  function addRoute(request, polyline) {
    setRoutes((prev) => {
      const existing = prev.find((r) => r.id === request.id);
      if (existing) {
        return prev.map((r) =>
          r.id === request.id ? { ...r, polyline } : r
        );
      }
      return [...prev, { id: request.id, request, polyline, selected: false }];
    });
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
    selectRoute,
    removeRoute,
    clearRoutes,
  };
}
