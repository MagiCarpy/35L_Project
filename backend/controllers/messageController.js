import { Message } from "../models/message.model.js";
import { Request } from "../models/request.model.js";
import { User } from "../models/user.model.js";
import asyncHandler from "express-async-handler";

const MessageController = {
    sendMessage: asyncHandler(async (req, res) => {
        const { requestId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content) {
            return res.status(400).json({ message: "Message content is required" });
        }

        // Verify user has access to this request (requester or helper)
        const request = await Request.findByPk(requestId);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.userId !== userId && request.helperId !== userId) {
            return res.status(403).json({ message: "Not authorized to chat in this request" });
        }

        const message = await Message.create({
            requestId,
            senderId: userId,
            content,
        });

        // Fetch sender info to return with message
        const sender = await User.findByPk(userId, { attributes: ["username", "image"] });

        return res.status(201).json({
            message: "Message sent",
            data: {
                ...message.toJSON(),
                senderName: sender.username,
                senderPic: sender?.image ? `/public/${sender.image}` : "/public/default.jpg",
            },
        });
    }),

    getMessages: asyncHandler(async (req, res) => {
        const { requestId } = req.params;
        const userId = req.user.id;

        // Verify user has access
        const request = await Request.findByPk(requestId);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.userId !== userId && request.helperId !== userId) {
            return res.status(403).json({ message: "Not authorized to view these messages" });
        }

        const messages = await Message.findAll({
            where: { requestId },
            order: [["createdAt", "ASC"]],
        });

        // Enrich messages with sender names (could be optimized with join)
        const enrichedMessages = await Promise.all(
            messages.map(async (msg) => {
                const sender = await User.findByPk(msg.senderId, { attributes: ["username", "image"] });
                return {
                    ...msg.toJSON(),
                    senderName: sender ? sender.username : "Unknown",
                    senderPic: `/public/${sender.image}`
                };
            })
        );

        return res.status(200).json({ messages: enrichedMessages });
    }),
};

export default MessageController;
