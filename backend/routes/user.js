import express from "express";
import UserController from "../controllers/userController.js";
import { upload } from "../controllers/userController.js";
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
router.get("/auth", UserController.auth);
router.get("/profile", UserController.profile);
router.post("/uploadPfp", upload.single("pfp"), UserController.uploadPfp);
router.get("/:id", UserController.getUser); // put :id based endpoints below the rest
router.delete("/:id", UserController.deleteUser);

export default router;
