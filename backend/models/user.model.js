import { sequelize } from "../config/db.js";
import { DataTypes, sql } from "@sequelize/core";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: sql.uuidV4,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        const hashedPassword = bcrypt.hashSync(value, SALT_ROUNDS);
        this.setDataValue("password", hashedPassword);
      },
    },
  },
  {
    tableName: "users",
  }
);
