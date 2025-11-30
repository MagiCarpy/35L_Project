import express from "express";
import { sequelize, createDatabaseIfNotExists } from "./config/db.js";
import "./models/request.model.js";
import session from "cookie-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/user.js";
import healthRoutes from "./routes/health.js";
import requestRoutes from "./routes/request.js";
import directionsRoutes from "./routes/directions.js";
import requireAuth from "./middleware/auth.js";

import cors from "cors";

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "..", ".env");
dotenv.config({ path: envPath });

// FIXME: change this to 5000 when done testing (my machine already uses port 5000)
const PORT = parseInt(process.env.PORT) || 5000;
const PUBLIC_PATH = path.resolve(__dirname, "..", "frontend", "public");

export const app = express();
app.use(express.json());
// Do not need CORS for /api endpoint (for now) because vite.config has a proxy to it
// app.use(
//   cors({
//     origin: "http://localhost:5173", // Frontend URL
//     credentials: true,
//   })
// );
app.use(
  session({
    name: "session",
    keys: [process.env.SESSION_SECRET, "supersecretkey"],
    maxAge: 1000 * 60 * 60 * 4, // 4 hours
    secure: false, // FIXME: set true in prod (needs HTTPS to work)
    httpOnly: true,
    sameSite: "strict",
  })
);

// serve static files
app.use("/public", express.static(PUBLIC_PATH));

import messageRoutes from "./routes/message.js";
import "./models/message.model.js";

app.use("/uploads", express.static("uploads"));

app.use("/api/user", userRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/directions", directionsRoutes);
app.use("/api/messages", messageRoutes);

// FIXME: delete this lol (test error page)
app.get("/testError", async (req, res, next) => {
  try {
    await sleep(2000);
    throw new Error("TEST");
  } catch (error) {
    console.log("error");
    console.error(error.message);
    next(error);
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error", err);
  res.status(500).json({ error: "Internal server error" });
});

app.get("/", (req, res) => {
  res.status(200).send("Server");
});

// Server start
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, async () => {
    console.log(`Server started on PORT: ${PORT}`);

    //Test database connection and create table if not already created
    await createDatabaseIfNotExists();
    connectAndSync();
  });
}

// Helper functions
async function connectAndSync() {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful.");

    await sequelize.sync({ alter: true }); // Creates tables if they don't exist + changes them
    // await sequelize.sync({ force: true }); // WARNING: Will drop existing tables and recreate them

    console.log("Models created and synchronized.");
  } catch (error) {
    console.error("Error connecting to database or syncing tables.", error);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
