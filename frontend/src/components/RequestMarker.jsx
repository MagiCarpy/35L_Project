import { Marker, Tooltip } from "react-leaflet";
import { dropoffIcon, pickupIcon } from "@/constants/mapIcons";

// type => "dropoff" or "pickup"
const RequestMarker = ({ request, type, handleMarkerClick, icon = null }) => {
  if (type === "dropoff") {
    if (!request?.dropoffLat || !request?.dropoffLng) return null;
  }

  if (type === "pickup") {
    if (!request?.pickupLat || !request?.pickupLng) return null;
  }

  return (
    <Marker
      position={
        type === "dropoff"
          ? [request.dropoffLat, request.dropoffLng]
          : [request.pickupLat, request.pickupLng]
      }
      icon={icon || (type === "dropoff" ? dropoffIcon : pickupIcon)}
      type={type}
      eventHandlers={{ click: () => handleMarkerClick(request) }}
    >
      <Tooltip>
        {type == "dropoff" && (
          <>
            <b>Dropoff:</b> {request.dropoffLocation}
          </>
        )}
        {type == "pickup" && (
          <>
            <b>Pickup:</b> {request.pickupLocation}
          </>
        )}
      </Tooltip>
    </Marker>
  );
};

export default RequestMarker;
