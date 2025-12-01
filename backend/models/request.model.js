import { DataTypes, sql } from "@sequelize/core";
import { sequelize } from "../config/db.js";

export const Request = sequelize.define(
  "Request",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: sql.uuidV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    item: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    pickupLocation: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    dropoffLocation: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("open", "accepted", "completed"),
      defaultValue: "open",
    },
    helperId: {
      type: DataTypes.UUID,
      allowNull: true, // gets filled when someone accepts
    },
    deliveryPhotoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    receiverConfirmed: {
      type: DataTypes.ENUM("pending", "received", "not_received"),
      defaultValue: "pending",
    },
    pickupLat: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    pickupLng: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    dropoffLat: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    dropoffLng: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
  },
  {
    tableName: "requests",
    timestamps: true,
  }
);
