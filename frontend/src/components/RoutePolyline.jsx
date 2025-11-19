import { Polyline, Tooltip } from "react-leaflet";

export default function RoutePolyline({ route }) {
  const color = route.selected ? "#ff00ff" : "purple";
  const weight = route.selected ? 6 : 4;

  return (
    <Polyline positions={route.polyline} color={color} weight={weight}>
      <Tooltip direction="center">
        {route.request.item} — {route.request.pickupLocation} → {route.request.dropoffLocation}
      </Tooltip>
    </Polyline>
  );
}
