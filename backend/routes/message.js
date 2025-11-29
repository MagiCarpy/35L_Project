import express from "express";
import MessageController from "../controllers/messageController.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();

router.post("/:requestId", requireAuth, MessageController.sendMessage);
router.get("/:requestId", requireAuth, MessageController.getMessages);

export default router;
