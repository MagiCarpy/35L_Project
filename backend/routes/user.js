import express from "express";
import User from "../controllers/userController.js";
const router = express.Router();

/*
TODO: Routes to implement
  register,
  login,
  getProfile,
  updateProfile,
  deleteProfile,

  Less Important:
  changePassword,
  forgotPassword,
  resetPassword, 
*/

router.post("/register", User.register);
router.post("/login", User.login);
router.get("/:id", User.profile);
router.delete("/:id", User.delete);

export default router;
