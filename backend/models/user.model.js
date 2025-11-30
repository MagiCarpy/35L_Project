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
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 50],
        is: /^[\w.]+$/,
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        len: [5, 255],
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [8, 120],
        isStrongEnough(value) {
          const strongRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          if (!strongRegex.test(value)) {
            throw new Error(
              `Password must have: ≥8 characters, uppercase letter, lowercase letter, special character: @$!%*?&`
            );
          }
        },
      },
      set(value) {
        this.setDataValue("password", bcrypt.hashSync(value, SALT_ROUNDS));
      },
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "default.jpg",
      validate: {
        is: /^[\w-]+\.(jpg|jpeg|png|gif)$/,
      },
    },
  },
  {
    tableName: "users",
    timestamps: true,
    paranoid: true,
    indexes: [{ fields: ["username"] }, { fields: ["email"] }],
    validate: {
      uniqueUsernameEmail() {
        if (this.username.toLowerCase() === this.email.toLowerCase()) {
          throw new Error("Username and email cannot be the same");
        }
      },
    },
  }
);
