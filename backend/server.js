import express from "express";
import dotenv from "dotenv";
import path from "path";
import { con } from "./config/db.js";
import { fileURLToPath } from "url";

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "..", ".env");
dotenv.config({ path: envPath });

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).send("Server");
});

// Make sure server is alive lol
app.get("/api/health", (req, res) => {
  res.status(200).json({ ok: true, message: "Server is running", ts: Date.now() });
});

app.get("/api/health/db", async (req, res) => {
  try {
    const [rows] = await con.query("SELECT 1 AS ok");
    res.status(200).json({ ok: !!rows?.length, message: "Database reachable", ts: Date.now() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Server start
app.listen(PORT, async () => {
  console.log(`Server started on PORT: ${PORT}`);

  //con.connect(err => { if (err) throw err});
  console.log("Connected");

  // initialize database (need to comment out db.js "database" attr)
  con.query("CREATE DATABASE IF NOT EXISTS projDB;");
  con.query(`CREATE TABLE IF NOT EXISTS USERS (
             ID CHAR(36) DEFAULT (UUID()) PRIMARY KEY,
             USERNAME VARCHAR(255) UNIQUE NOT NULL,
             EMAIL VARCHAR(255) UNIQUE NOT NULL,
             PASSWORD VARCHAR(255));`);
  con.query("SHOW TABLES;");
});
