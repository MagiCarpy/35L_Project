import express from "express";
import UserRoutes from "../controllers/userController.js";
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
router.get("/:id", UserRoutes.profile);
router.delete("/:id", UserRoutes.delete);

export default router;
