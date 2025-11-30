import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DINING_HALLS } from "../../constants/diningHalls";
import { RES_HALLS } from "../../constants/resHalls";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/ToastContext";

function NewRequest() {
  const [item, setItem] = useState("");
  const [pickupKey, setPickupKey] = useState("");
  const [dropoffKey, setDropoffKey] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function submitReq(e) {
    e.preventDefault();
    const pickup = DINING_HALLS[pickupKey];
    const dropoff = RES_HALLS[dropoffKey];

    if (!pickup || !dropoff) return alert("Please choose valid locations.");

    const resp = await fetch("/api/requests", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item,
        pickupLocation: pickup.label,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        dropoffLocation: dropoff.label,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
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
              </select>
            </div>

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
              </select>
            </div>

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
