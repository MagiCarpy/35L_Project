import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DINING_HALLS } from "../../constants/diningHalls";
import { RES_HALLS } from "../../constants/resHalls";
import { Button } from "@/components/ui/button";

function NewRequest() {
  const [item, setItem] = useState("");
  const [pickupKey, setPickupKey] = useState("");
  const [dropoffKey, setDropoffKey] = useState("");
  const navigate = useNavigate();

  const submitReq = async (e) => {
    e.preventDefault();

    const pickup = DINING_HALLS[pickupKey];
    const dropoff = RES_HALLS[dropoffKey];

    if (!pickup || !dropoff) {
      alert("Please choose a dining hall and dropoff hall");
      return;
    }

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
      navigate("/requests");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create a New Delivery Request</h2>

      <form onSubmit={submitReq}>

        {/* item input */}
        <label>Item: </label>
        <input
          value={item}
          onChange={(e) => setItem(e.target.value)}
          required
        />

        <br /><br />

        {/* dining hall dropdown */}
        <label>Pickup (Dining Hall): </label>
        <select
          value={pickupKey}
          onChange={(e) => setPickupKey(e.target.value)}
          className="w-[200px]"
          required
        >
          <option value="">Select Dining Hall</option>
          {Object.entries(DINING_HALLS).map(([key, hall]) => (
            <option key={key} value={key}>{hall.label}</option>
          ))}
        </select>

        <br /><br />

        {/* residential hall dropdown */}
        <label>Dropoff (Residential Hall): </label>
        <select
          value={dropoffKey}
          onChange={(e) => setDropoffKey(e.target.value)}
          className="w-[200px]"
          required
        >
          <option value="">Select Residence</option>
          {Object.entries(RES_HALLS).map(([key, hall]) => (
            <option key={key} value={key}>{hall.label}</option>
          ))}
        </select>

        <br /><br />

        <Button type="submit">Create</Button>
      </form>
    </div>
  );
}

export default NewRequest;
