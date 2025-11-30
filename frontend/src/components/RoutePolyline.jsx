import React from "react";
import { Polyline } from "react-leaflet";

function RoutePolyline({ route, highlight }) {
  if (!route?.polyline) return null;

  return (
    <Polyline
      positions={route.polyline}
      pathOptions={{
        color: highlight ? "#377dff" : "#999",
        weight: highlight ? 6 : 4,
        opacity: 0.9,
      }}
    />
  );
}

export default React.memo(RoutePolyline);
