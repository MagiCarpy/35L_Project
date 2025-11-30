import express from "express";
import RequestController from "../controllers/requestController.js";
import uploadDeliveryPhoto from "../middleware/uploadDeliveryPhoto.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, RequestController.create);
router.get("/", RequestController.list);
router.get("/user/stats", requireAuth, RequestController.getUserStats);
router.get("/:id", RequestController.getOne);
router.post("/:id/accept", requireAuth, RequestController.accept);

router.post(
  "/:id/upload-photo",
  requireAuth,
  uploadDeliveryPhoto.single("photo"),
  RequestController.uploadPhoto
);

router.post("/:id/complete-delivery", requireAuth, RequestController.completeDelivery);
router.post("/:id/confirm-received", requireAuth, RequestController.confirmReceived);
router.post("/:id/confirm-not-received", requireAuth, RequestController.confirmNotReceived);
router.delete("/:id", requireAuth, RequestController.delete);


export default router;
