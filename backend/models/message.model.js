import { sequelize } from "../config/db.js";
import { DataTypes, sql } from "@sequelize/core";

// Message model
export const Message = sequelize.define(
    "Message",
    {
        // Message id: one can use this id to track messages
        id: {
            type: DataTypes.UUID,
            defaultValue: sql.uuidV4,
            primaryKey: true,
        },
        // request id: this is who ever that created the request
        requestId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        // sender id: this is who ever that delivers the request
        senderId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        // Message content should just be text (can change if needed)
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        tableName: "messages",
        timestamps: true,
    }
);
