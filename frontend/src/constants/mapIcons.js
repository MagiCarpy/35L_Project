import L from "leaflet";

// base SVG pin generator
function makePin(color, size = 32) {
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 24 24' fill='${color}'>
      <path d='M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z'/>
    </svg>
  `;

  return L.icon({
    iconUrl: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
    tooltipAnchor: [0, -30],
  });
}

// pickup (blue, bigger)
export const pickupIcon = makePin("#377dff", 35);

// dropoff (red, slightly smaller)
export const dropoffIcon = makePin("#ff4d4d", 22);

// accepted req marker (yellow)
export const acceptedIcon = makePin("#f0c419", 35);

// completed req (green)
export const completedIcon = makePin("#3ccf4e", 35);
