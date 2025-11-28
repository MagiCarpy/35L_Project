import express from "express";
import RequestController from "../controllers/requestController.js";
import uploadDeliveryPhoto from "../middleware/uploadDeliveryPhoto.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();

// create + list + get
router.post("/", requireAuth, RequestController.create);
router.get("/", RequestController.list);
router.get("/:id", RequestController.getOne);

// lifecycle actions
router.post("/:id/accept", requireAuth, RequestController.accept);
router.post("/:id/start-delivery", requireAuth, RequestController.startDelivery);
router.post("/:id/cancel-helper", requireAuth, RequestController.cancelByHelper);
router.post(
  "/:id/cancel-requester",
  requireAuth,
  RequestController.cancelByRequester
);

// photo upload
router.post(
  "/:id/upload-photo",
  requireAuth,
  uploadDeliveryPhoto.single("photo"),
  RequestController.uploadPhoto
);

// completion & receiver confirmation
router.post(
  "/:id/complete-delivery",
  requireAuth,
  RequestController.completeDelivery
);
router.post(
  "/:id/confirm-received",
  requireAuth,
  RequestController.confirmReceived
);
router.post(
  "/:id/confirm-not-received",
  requireAuth,
  RequestController.confirmNotReceived
);

// delete (for now)
router.delete("/:id", requireAuth, RequestController.delete);

export default router;
