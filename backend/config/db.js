import { Sequelize } from "@sequelize/core";
import { MySqlDialect } from "@sequelize/mysql";
import { ROOT_ENV_PATH } from "./paths.js";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import testSequelize from "./testDb.js";

// Define __dirname for ESM
dotenv.config({ path: ROOT_ENV_PATH });

const DB_PORT = parseInt(process.env.MYSQL_PORT) || 3306;
const DB_HOST = process.env.MYSQL_HOST;
const DB_USER = process.env.MYSQL_USER;
const DB_PASS = process.env.MYSQL_PASS;
const DB_NAME = process.env.MYSQL_DB;
const NODE_ENV = process.env.NODE_ENV;

export async function createDatabaseIfNotExists() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    port: DB_PORT,
  });

  try {
    const [rows] = await connection.execute(
      `SELECT SCHEMA_NAME FROM information_schema.schemata WHERE SCHEMA_NAME = ?`,
      [DB_NAME]
    );

    if (rows.length <= 0) {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
      console.log(`Database ${DB_NAME} created for the first time.`);
    } else {
      console.log(`Database ${DB_NAME} exists. Using existing database.`);
    }
  } catch (error) {
    console.error("Error creating database!", error);
    throw error;
  } finally {
    await connection.end();
  }
}

// conditionally use in memory sqlite db for testing suite
export const sequelize =
  NODE_ENV === "test"
    ? testSequelize
    : new Sequelize({
        dialect: MySqlDialect,
        database: DB_NAME,
        user: DB_USER,
        password: DB_PASS,
        host: DB_HOST,
        port: DB_PORT,
      });
