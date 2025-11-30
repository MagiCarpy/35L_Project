// config/testDb.js
import { Sequelize } from "@sequelize/core";
import { ROOT_ENV_PATH } from "./paths.js";
import dotenv from "dotenv";

// Define __dirname for ESM
dotenv.config({ path: ROOT_ENV_PATH });

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
