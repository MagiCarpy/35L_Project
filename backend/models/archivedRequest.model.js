import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

export const ArchivedRequest = sequelize.define(
  "ArchivedRequest",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    originalRequestId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    helperId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    item: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.STRING(150), allowNull: true },
    
    pickupLocation: { type: DataTypes.STRING(255), allowNull: false },
    dropoffLocation: { type: DataTypes.STRING(255), allowNull: false },

    pickupLat: { type: DataTypes.FLOAT, allowNull: true },
    pickupLng: { type: DataTypes.FLOAT, allowNull: true },
    dropoffLat: { type: DataTypes.FLOAT, allowNull: true },
    dropoffLng: { type: DataTypes.FLOAT, allowNull: true },

    deliveryPhotoUrl: { type: DataTypes.STRING, allowNull: true },

    receiverConfirmed: {
      type: DataTypes.ENUM("pending", "received", "not_received"),
      defaultValue: "pending",
    },

    completedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "archived_requests",
    timestamps: true,
  }
);
