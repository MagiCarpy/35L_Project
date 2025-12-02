import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DINING_HALLS } from "../../constants/diningHalls";
import { RES_HALLS } from "../../constants/resHalls";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/ToastContext";
import { useEffect, useRef } from "react";
import Minimap from "../../components/Minimap";

function NewRequest() {
  const [item, setItem] = useState("");
  const [pickupKey, setPickupKey] = useState("");
  const [dropoffKey, setDropoffKey] = useState("");
  const [customPickup, setCustomPickup] = useState(null);
  const [customDropoff, setCustomDropoff] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const pickupMapRef = useRef(null);
  const dropoffMapRef = useRef(null);

  useEffect(() => {
    if (pickupKey === "custom" && pickupMapRef.current) {
      pickupMapRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [pickupKey]);

  useEffect(() => {
    if (dropoffKey === "custom" && dropoffMapRef.current) {
      dropoffMapRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [dropoffKey]);

  async function submitReq(e) {
    e.preventDefault();
    let pickupData, dropoffData;

    // Pick up
    if (pickupKey === "custom") {
      if (!customPickup)
        return alert("Please click a pickup point on the map.");
      pickupData = {
        label: "Custom Pickup",
        lat: customPickup.lat,
        lng: customPickup.lng,
      };
    } else {
      pickupData = DINING_HALLS[pickupKey];
    }

    // Drop off
    if (dropoffKey === "custom") {
      if (!customDropoff)
        return alert("Please click a dropoff point on the map.");
      dropoffData = {
        label: "Custom Dropoff",
        lat: customDropoff.lat,
        lng: customDropoff.lng,
      };
    } else {
      dropoffData = RES_HALLS[dropoffKey];
    }

    const resp = await fetch("/api/requests", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item,
        pickupLocation: pickupData.label,
        pickupLat: pickupData.lat,
        pickupLng: pickupData.lng,
        dropoffLocation: dropoffData.label,
        dropoffLat: dropoffData.lat,
        dropoffLng: dropoffData.lng,
      }),
    });

    if (resp.status === 201) {
      showToast("Request created!", "success");
      navigate("/requests");
    } else {
      showToast("Failed to create request", "error");
    }
  }

  return (
    <div className="flex justify-center w-full p-6">
      <Card className="w-full max-w-lg border-border shadow">
        <CardHeader>
          <CardTitle className="text-blue-700 dark:text-blue-300 text-2xl">
            Create Delivery Request
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={submitReq} className="flex flex-col gap-6">
            <div>
              <p className="text-sm font-medium mb-1">Item</p>
              <Input
                value={item}
                maxLength={50}
                onChange={(e) => setItem(e.target.value)}
                required
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Pickup — Dining Hall</p>
              <select
                value={pickupKey}
                onChange={(e) => setPickupKey(e.target.value)}
                className="w-full border border-input rounded-md p-2"
                required
              >
                <option value="">Select Dining Hall</option>
                {Object.entries(DINING_HALLS).map(([key, hall]) => (
                  <option key={key} value={key}>
                    {hall.label}
                  </option>
                ))}
                <option value="custom">Custom Location</option>
              </select>
            </div>

            {pickupKey === "custom" && (
              <div ref={pickupMapRef}>
                <Minimap value={customPickup} onChange={setCustomPickup} />
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-1">Dropoff — Residence</p>
              <select
                value={dropoffKey}
                onChange={(e) => setDropoffKey(e.target.value)}
                className="w-full border border-input rounded-md p-2"
                required
              >
                <option value="">Select Residence</option>
                {Object.entries(RES_HALLS).map(([key, hall]) => (
                  <option key={key} value={key}>
                    {hall.label}
                  </option>
                ))}
                <option value="custom">Custom Location</option>
              </select>
            </div>

            {dropoffKey === "custom" && (
              <div ref={dropoffMapRef}>
                <Minimap value={customDropoff} onChange={setCustomDropoff} />
              </div>
            )}

            <Button type="submit" className="w-full">
              Create Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default NewRequest;
