import express from "express";
import RequestController from "../controllers/requestController.js";
import uploadDeliveryPhoto from "../middleware/uploadDeliveryPhoto.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, RequestController.create);
router.get("/", RequestController.list);
router.get("/:id", RequestController.getOne);
router.post("/:id/accept", requireAuth, RequestController.accept);
router.delete("/:id", requireAuth, RequestController.delete);
router.post("/:id/upload-photo", requireAuth, uploadDeliveryPhoto.single("photo"), RequestController.uploadPhoto);

export default router;
