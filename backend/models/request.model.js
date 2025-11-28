import { DataTypes } from "@sequelize/core";
import { sequelize } from "../config/db.js";

const Request = sequelize.define("Request", {
    id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },

  userId: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },

  helperId: {
    type: DataTypes.STRING(36),
    allowNull: true,
  },

  item: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  pickupLocation: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  dropoffLocation: {
    type: DataTypes.STRING,
    allowNull: false,
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

  status: {
    type: DataTypes.ENUM(
      "open",
      "accepted",
      "in_delivery",
      "completed",
      "received",
      "not_received",
      "cancelled_by_requester"
    ),
    defaultValue: "open",
  },

  deliveryPhotoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  receiverConfirmed: {
    type: DataTypes.ENUM("pending", "received", "not_received"),
    defaultValue: "pending",
  },
});

export { Request };
