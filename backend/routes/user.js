import express from "express";
import UserController from "../controllers/userController.js";
import { upload } from "../middleware/imgFileValidator.js";
import requireAuth from "../middleware/auth.js";
const router = express.Router();

/*
TODO: Routes to implement
  register, done
  login, done
  getProfile, done
  updateProfile,
  deleteProfile, done

  Less Important:
  changePassword,
  forgotPassword,
  resetPassword, 
*/

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/logout", UserController.logout);
router.post("/auth", requireAuth, UserController.auth);
router.get("/me", UserController.getMe);
router.post(
  "/uploadPfp",
  upload.single("pfp"),
  requireAuth,
  UserController.uploadPfp
);

router.get("/:id", UserController.getUser);
router.delete("/:id", UserController.deleteUser);

export default router;
