import express from "express";
import RequestController from "../controllers/requestController.js";

const router = express.Router();

router.post("/", RequestController.create);
router.get("/", RequestController.list);
router.get("/:id", RequestController.getOne);
router.post("/:id/accept", RequestController.accept);
router.delete("/:id", RequestController.delete);

export default router;
