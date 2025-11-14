import express from "express";
import { sequelize, createDatabaseIfNotExists } from "./config/db.js";
import session from "cookie-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/user.js";
import healthRoutes from "./routes/health.js";
import { requireAuth } from "./middleware/userSession.js";
import cors from "cors";

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "..", ".env");
dotenv.config({ path: envPath });

const PORT = parseInt(process.env.PORT) || 5000;

const app = express();
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

app.use("/api/user", userRoutes);
app.use("/api/health", healthRoutes);

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

app.get("/testSessionLogin", async (req, res, next) => {
  try {
    req.session.userId = "7edafb06-b41d-4ac2-a020-a6de13a69ed8";

    res.end("Session: " + req.session.userId);
  } catch (error) {
    next(error);
  }
});

app.get("/testSessionLogout", async (req, res, next) => {
  try {
    req.session = null;
    res.end("logged Out");
  } catch (error) {
    next(error);
  }
});

app.get("/testProtected", requireAuth, async (req, res, next) => {
  res.send("secret shit lol");
});

// Error Handling Middleware (shows this page if error)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Error Occurred");
});

app.get("/", (req, res) => {
  res.status(200).send("Server");
});

// Server start
app.listen(PORT, async () => {
  console.log(`Server started on PORT: ${PORT}`);

  //Test database connection and create table if not already created
  await createDatabaseIfNotExists();
  connectAndSync();
});

// Helper functions
async function connectAndSync() {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful.");

    await sequelize.sync(); // Creates tables if they don't exist
    // await sequelize.sync({ force: true }); // WARNING: Will drop existing tables and recreate them

    console.log("Models created and synchronized.");
  } catch (error) {
    console.error("Error connecting to database or syncing tables.", error);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
