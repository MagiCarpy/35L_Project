import express from "express";
const router = express.Router();

/* 
Server and host services health check logic 

Routes to check if connections to dependent systems, such as the database, are working.
*/

// Make sure server is alive lol
router.get("/", (req, res) => {
  res
    .status(200)
    .json({ ok: true, message: "Server is running", ts: Date.now() });
});

router.get("/db", async (req, res) => {
  try {
    const [rows] = await con.query("SELECT 1 AS ok");
    res.status(200).json({
      ok: !!rows?.length,
      message: "Database reachable",
      ts: Date.now(),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
