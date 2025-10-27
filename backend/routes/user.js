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

router.get("/register", User.create);

export default router;
