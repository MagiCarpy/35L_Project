import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Sequelize } from "@sequelize/core";
import { MySqlDialect } from "@sequelize/mysql";

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "..", "..", ".env");
dotenv.config({ path: envPath });

const DB_PORT = parseInt(process.env.MYSQL_PORT) || 3306;
const DB_HOST = process.env.MYSQL_HOST;
const DB_USER = process.env.MYSQL_USER;
const DB_PASS = process.env.MYSQL_PASS;
const DB_NAME = process.env.MYSQL_DB;

export const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASS,
  host: DB_HOST,
  port: DB_PORT,
});

export default sequelize;
