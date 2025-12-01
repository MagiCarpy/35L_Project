import { User } from "./user.model.js";
import { Request } from "./request.model.js";
import { Message } from "./message.model.js";

// Define associations
User.hasMany(Request, { foreignKey: "userId", as: "requests" });
Request.belongsTo(User, { foreignKey: "userId", as: "user" });

Request.hasMany(Message, { foreignKey: "requestId", as: "messages" });
Message.belongsTo(Request, { foreignKey: "requestId", as: "request" });

User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
