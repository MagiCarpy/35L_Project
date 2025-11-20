import { useEffect, useState } from "react";
import { Polyline, Tooltip } from "react-leaflet";

export default function RoutePolyline({ route }) {
  const [points, setPoints] = useState(route.polyline || []);

  // draw-on animation
  useEffect(() => {
    if (!route.polyline || route.polyline.length === 0) return;

    const SPEED = 1;        // points per frame — LOWER = slower
    const INTERVAL = 20;    // ms between frames — HIGHER = slower

    let i = 1;
    setPoints([route.polyline[0]]);

    const id = setInterval(() => {
      i += SPEED;

      if (i >= route.polyline.length) {
        setPoints(route.polyline);
        clearInterval(id);
      } else {
        setPoints(route.polyline.slice(0, i));
      }
    }, INTERVAL);

    return () => clearInterval(id);
  }, [route.id, route.polyline]);


  const color = route.color || (route.selected ? "#ff00ff" : "#7f00ff");
  const weight = route.selected ? 6 : 4;

  const km =
    route.distance != null ? (route.distance / 1000).toFixed(2) : null;
  const mins =
    route.duration != null ? Math.round(route.duration / 60) : null;

  return (
    <Polyline positions={points} color={color} weight={weight}>
      <Tooltip direction="top" offset={[0, -10]}>
        <div>
          <div>
            {route.request.item} — {route.request.pickupLocation} →{" "}
            {route.request.dropoffLocation}
          </div>
          {km && mins && (
            <div>
              ~{km} km, ~{mins} min
            </div>
          )}
        </div>
      </Tooltip>
    </Polyline>
  );
}
