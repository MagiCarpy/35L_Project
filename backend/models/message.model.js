import { sequelize } from "../config/db.js";
import { DataTypes, sql } from "@sequelize/core";

export const Message = sequelize.define(
    "Message",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: sql.uuidV4,
            primaryKey: true,
        },
        requestId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        senderId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
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
