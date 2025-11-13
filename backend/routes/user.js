import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/profile", getProfile);

export default router;
