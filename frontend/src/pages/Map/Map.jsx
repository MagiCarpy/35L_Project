import { MapContainer, TileLayer, Polygon, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "./Map.css";
import "leaflet/dist/leaflet.css";

function MapScreen() {
  const [coords, setCoords] = useState(null);

  function MouseCoordinates() {
    useMapEvents({
      mousemove(e) {
        setCoords([e.latlng.lat, e.latlng.lng]);
      },
    });
    return coords ? (
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          background: "black",
          padding: "5px",
          zIndex: 1000,
        }}
      >
        Lat: {coords[0].toFixed(4)}, Lng: {coords[1].toFixed(4)}
      </div>
    ) : null;
  }

  return (
    <MapContainer
      center={[34.0699, -118.4465]}
      zoom={15}
      className="map-container"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MouseCoordinates />
    </MapContainer>
  );
}

export default MapScreen;
