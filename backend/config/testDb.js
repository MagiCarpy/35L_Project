// config/testDb.js
import { Sequelize } from "@sequelize/core";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "..", "..", ".env");
dotenv.config({ path: envPath });

const testSequelize = new Sequelize({
  dialect: "sqlite",
  storage: ":memory:",
  logging: false,
  pool: {
    max: 1,
    idle: Infinity,
    maxUses: Infinity,
  },
});

export default testSequelize;
