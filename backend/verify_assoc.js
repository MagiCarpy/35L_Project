import { sequelize } from "./config/db.js";
import { Request } from "./models/request.model.js";
import { User } from "./models/user.model.js";
import "./models/associations.js";

async function test() {
    try {
        await sequelize.authenticate();
        console.log("DB connected");

        // Sync not needed if tables exist, but associations are logical

        const requests = await Request.findOne({
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["username"],
                },
            ],
        });

        console.log("Query successful!");
        if (requests) {
            console.log("Found request with user:", requests.user ? requests.user.username : "No user associated");
        } else {
            console.log("No requests found, but query syntax is correct.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

test();
