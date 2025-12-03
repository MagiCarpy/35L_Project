import express from "express";
import { sequelize, createDatabaseIfNotExists } from "./config/db.js";
import { ROOT_ENV_PATH, PUBLIC_PATH } from "./config/paths.js";
import session from "cookie-session";
import dotenv from "dotenv";
import userRoutes from "./routes/user.js";
import healthRoutes from "./routes/health.js";
import requestRoutes from "./routes/request.js";
import directionsRoutes from "./routes/directions.js";
import cors from "cors";
import "./models/request.model.js";
import "./models/associations.js";  
import "./models/message.model.js";
import "./models/associations.js";

dotenv.config({ path: ROOT_ENV_PATH });

const PORT = parseInt(process.env.PORT) || 5000;

export const app = express();

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(
  session({
    name: "session",
    keys: [process.env.SESSION_SECRET || "supersecretkey"],
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
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

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error", err);
  res.status(500).json({ error: "Internal server error" });
});

// Serve Static Assets in Production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(ROOT_PATH, "frontend", "dist")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(ROOT_PATH, "frontend", "dist", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.status(200).send("Server is running...");
  });
}

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
