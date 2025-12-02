// config/testDb.js
import { Sequelize } from "sequelize";
import { ROOT_ENV_PATH } from "./paths.js";
import dotenv from "dotenv";

dotenv.config({ path: ROOT_ENV_PATH });

const testSequelize = new Sequelize("sqlite::memory:", {
  logging: false,
});

export default testSequelize;
