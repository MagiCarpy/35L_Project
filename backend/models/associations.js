import { User } from "./user.model.js";
import { Request } from "./request.model.js";
import { Message } from "./message.model.js";

User.hasMany(Request, { foreignKey: "user_id", as: "requests", constraints: false });
Request.belongsTo(User, { foreignKey: "user_id", as: "user", constraints: false });

Request.hasMany(Message, { foreignKey: "request_id", as: "messages", constraints: false });
Message.belongsTo(Request, { foreignKey: "request_id", as: "request", constraints: false });

User.hasMany(Message, { foreignKey: "sender_id", as: "sentMessages", constraints: false });
Message.belongsTo(User, { foreignKey: "sender_id", as: "sender", constraints: false });

Request.belongsTo(User, { foreignKey: "helperId", as: "helper", constraints: false });
