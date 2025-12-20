import L from "leaflet";
import { pickupIcon, dropoffIcon } from "./mapIcons";

export function createClusterCustomIcon(cluster) {
  const markers = cluster.getAllChildMarkers();

  // Only group pickup locations
  const pickupMarkers = markers.filter((marker) => {
    return marker.options.type === "pickup";
  });

  const count = pickupMarkers.length;
  const iconUrl = pickupIcon.options.iconUrl;
  const colorName = "Pickups";

  // Initialize html to an empty string or a default icon if count is 0
  let html = "";

  if (count > 0) {
    // groups and renders multiple pickups (not dropoffs)
    if (count === 1) {
      return L.divIcon({
        html: `<img src="${iconUrl}" class="cluster-pin-img" style="width: 40px; height: 40px;" />`,
        className: "cluster-pin-single",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });
    }
    html = `
    <div class="cluster-pin-container">
      <img src="${iconUrl}" class="cluster-pin-img" />
      <div class="cluster-badge">${count}</div>
      <div class="cluster-tooltip">${colorName}: ${count} nearby</div>
    </div>
    `;
  } else {
    // if count === 0, cluster of dropoffs. Only group and render multiple pickups.
    html = `<img src="${dropoffIcon.options.iconUrl}" />`;
  }

  return L.divIcon({
    html,
    className: "cluster-pin",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    tooltipAnchor: [0, -40],
  });
}
