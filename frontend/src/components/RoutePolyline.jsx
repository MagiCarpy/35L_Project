import React, { useEffect, useState } from "react";
import { Polyline, useMap } from "react-leaflet";
import L from "leaflet";

function RoutePolyline({ route, highlight }) {
  const map = useMap();
  const [animatedPolyline, setAnimatedPolyline] = useState([]);

  useEffect(() => {
    if (!route?.polyline) return;

    let isCancelled = false;
    const full = route.polyline;
    let index = 0;

    const step = () => {
      if (isCancelled) return;

      index++;
      if (index > full.length) index = full.length;

      setAnimatedPolyline(full.slice(0, index));

      if (index < full.length)
        requestAnimationFrame(step);
    };

    step();

    return () => {
      isCancelled = true;
    };
  }, [route.id]);

  return (
    <Polyline
      positions={animatedPolyline}
      pathOptions={{
        color: highlight ? "#377dff" : "#999",
        weight: highlight ? 6 : 4,
        opacity: 0.9,
      }}
    />
  );
}

export default React.memo(RoutePolyline, (prevProps, nextProps) => {
  return prevProps.route.id === nextProps.route.id &&
         prevProps.highlight === nextProps.highlight;
});
