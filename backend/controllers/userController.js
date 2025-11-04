import { User } from "../models/user.model.js";
import asyncHandler from "express-async-handler"; // allows for easy error routing (less try and catch)
import bcrypt from "bcrypt";

// Add the all the database user table interactions to be used in the user routes
// ex. create user, delete user, get all users, etc

// add body parameter validation later (express-validator)

// security!!! should probably add security features (ex. not everyone should be able to access someone else's profile)
const saltRounds = 10;

const UserRoutes = {
  register: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    try {
      const user = await User.create({
        username: username,
        email: email,
        password: password,
      });

      return res.json({
        success: true,
        message: "User registered successfully",
        user: {
          username: username,
          email: email,
          password: password,
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to create user." });
    }
  }),
  login: asyncHandler(async (req, res) => {
    // assumes login form has email and password (can add username later if needed)
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(401).json({
        success: false,
        message: "User login failed. Invalid inputs.",
      });

    const user = await User.findOne({ where: { email: email } });

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User login failed. No user found." });

    const isValidUser = bcrypt.compareSync(password, user.password);

    if (isValidUser) {
      req.session.userId = user.id;
      return res
        .status(200)
        .json({ success: true, message: "User logged in." });
    } else
      return res.status(401).json({
        success: false,
        message: "User login failed. Bad credentials.",
      });
  }),
  logout: asyncHandler(async (req, res) => {
    req.session = null;

    return res.status(200).json({ success: true, message: "User logged out." });
  }),
  auth: asyncHandler(async (req, res) => {
    try {
      const sessionId = req.session.userId;
      if (!sessionId) throw new Error("Unauthorized");

      const user = await User.findOne({ where: { id: sessionId } });

      if (!user) throw new Error("Unauthorized");

      return res.status(200).json({ authenticated: true, userId: user.id });
    } catch (error) {
      res.status(401).json({ authenticated: false });
    }
  }),
  profile: asyncHandler(async (req, res) => {
    if (!req.session.userId) return res.status(403).json({ success: false });

    const user = await User.findOne({ where: { id: req.session.userId } });

    if (!user) return res.status(404).json({ success: false });

    return res.status(200).json({
      success: true,
      user: { userId: user.id, username: user.username, email: user.email },
    });
  }),
  getUser: asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Id parameter is required." });

    try {
      const user = await User.findOne({ where: { id: id } });

      if (!user) throw new Error("User id not found.");

      return res.status(200).json({
        success: true,
        message: `User found with id: ${id}`,
        user: { userId: user.id, username: user.username, email: user.email },
      });
    } catch (error) {
      return res
        .status(404)
        .json({ success: false, message: "User id not found." });
    }
  }),
  deleteUser: asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Id parameter is required." });

    try {
      const user = await User.destroy({ where: { id: id } });

      if (user === 0) throw new Error("User id not found.");

      return res
        .status(200)
        .json({ success: true, message: `User ${id}, deleted.` });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: "User id not found.",
      });
    }
  }),
};

export default UserRoutes;
