import { useState } from "react";
import { useNavigate } from "react-router-dom";

function NewRequest() {
  const [item, setItem] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const navigate = useNavigate();

  const submitReq = async (e) => {
    e.preventDefault();

    const resp = await fetch("/api/requests", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item,
        pickupLocation: pickup,
        dropoffLocation: dropoff,
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
        <label>Item: </label>
        <input value={item} onChange={(e) => setItem(e.target.value)} required />

        <br />

        <label>Pickup Location: </label>
        <input value={pickup} onChange={(e) => setPickup(e.target.value)} required />

        <br />

        <label>Dropoff Location: </label>
        <input value={dropoff} onChange={(e) => setDropoff(e.target.value)} required />

        <br /><br />

        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default NewRequest;
