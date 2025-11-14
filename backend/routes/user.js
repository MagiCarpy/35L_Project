import express from "express";
import UserRoutes from "../controllers/userController.js";
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

router.post("/register", UserRoutes.register);
router.post("/login", UserRoutes.login);
router.get("/logout", UserRoutes.logout);
router.get("/auth", UserRoutes.auth);
router.get("/profile", UserRoutes.profile);
router.post("/uploadPfp", upload.single("pfp"), UserRoutes.uploadPfp);
router.get("/:id", UserRoutes.getUser); // put :id based endpoints below the rest
router.delete("/:id", UserRoutes.deleteUser);

export default router;
