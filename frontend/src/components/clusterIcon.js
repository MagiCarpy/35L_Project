import L from "leaflet";
import { pickupIcon, dropoffIcon } from "../constants/mapIcons";

export function createClusterCustomIcon(cluster) {
  const markers = cluster.getAllChildMarkers();
  const count = markers.length;

  // determine type from first marker in cluster
  const firstMarker = markers[0];
  const type = firstMarker.options.type === "pickup" ? "pickup" : "dropoff";

  const iconUrl = type === "pickup"
    ? pickupIcon.options.iconUrl
    : dropoffIcon.options.iconUrl;

  const colorName = type === "pickup" ? "Pickups" : "Dropoffs";

  const html = `
    <div class="cluster-pin-container">
      <img src="${iconUrl}" class="cluster-pin-img" />
      <div class="cluster-badge">${count}</div>
      <div class="cluster-tooltip">${colorName}: ${count} nearby</div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "cluster-pin",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    tooltipAnchor: [0, -40]
  });
}
