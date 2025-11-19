import asyncHandler from "express-async-handler";
import axios from "axios";

export const getDirections = asyncHandler(async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ message: "Missing required query params: from, to" });
  }

  const [fromLat, fromLng] = from.split(",").map(Number);
  const [toLat, toLng] = to.split(",").map(Number);

  try {
    // call ORS API
    const resp = await axios.post(
      "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
      {
        coordinates: [
          [fromLng, fromLat],
          [toLng, toLat]
        ]
      },
      {
        headers: {
          Authorization: process.env.ORS_API_KEY, // use your own key pls
          "Content-Type": "application/json",
        }
      }
    );

    const geometry = resp.data.features[0].geometry.coordinates;
    const polyline = geometry.map(([lng, lat]) => [lat, lng]);

    return res.status(200).json({ polyline });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch directions" });
  }
});
