import { User } from "../models/user.model.js";
import { ValidationError } from "sequelize";
import { validateImgFile } from "../middleware/imgFileValidator.js";
import { PUBLIC_PATH } from "../config/paths.js";
import path from "path";
import asyncHandler from "express-async-handler"; // allows for easy error routing (less try and catch)
import fs from "fs/promises";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Add the all the database user table interactions to be used in the user routes
// ex. create user, delete user, get all users, etc

// add body parameter validation later (express-validator)

// security!!! should probably add security features (ex. not everyone should be able to access someone else's profile)

// FIXME: Add messages to each json as popup alert for users

await fs.mkdir(PUBLIC_PATH, { recursive: true }).catch(() => {});

const UserController = {
  register: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    try {
      const user = await User.create({
        username: username,
        email: email,
        password: password,
      });

      return res.status(200).json({
        message: "User registered successfully",
        user: {
          username: username,
          email: email,
        },
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        const messages = error.errors.map((err) => err.message);
        // show only first error message
        return res.status(400).json({
          message: messages[0],
        });
      }

      next(error);
    }
  }),
  login: asyncHandler(async (req, res) => {
    // assumes login form has email and password (can add username later if needed)
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(401).json({
        message: "User login failed. Invalid inputs.",
      });

    const user = await User.findOne({ where: { email: email } });

    if (!user)
      return res
        .status(401)
        .json({ message: "User login failed. No user found." });

    const isValidUser = bcrypt.compareSync(password, user.password);

    if (isValidUser) {
      req.session.userId = user.id;
      return res.status(200).json({ message: "User logged in." });
    } else
      return res.status(401).json({
        message: "User login failed. Bad credentials.",
      });
  }),
  logout: asyncHandler(async (req, res) => {
    req.session = null;

    return res.status(200).json({ message: "User logged out." });
  }),
  auth: asyncHandler(async (req, res) => {
    return res.json({
      user: {
        userId: req.user.id,
        username: req.user.username,
        email: req.user.email,
        profileImg: req.user.image,
      },
    });
  }),
  getUser: asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id)
      return res.status(400).json({ message: "Id parameter is required." });

    try {
      const user = await User.findOne({ where: { id: id } });

      if (!user) throw new Error("User id not found.");

      return res.status(200).json({
        message: `User found with id: ${id}`,
        user: { userId: user.id, username: user.username, email: user.email },
      });
    } catch (error) {
      return res.status(404).json({ message: "User id not found." });
    }
  }),
  deleteUser: asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id)
      return res.status(400).json({ message: "Id parameter is required." });

    try {
      const user = await User.destroy({ where: { id: id } });

      if (user === 0) throw new Error("User id not found.");

      return res.status(200).json({ message: `User ${id}, deleted.` });
    } catch (error) {
      return res.status(404).json({
        message: "User id not found.",
      });
    }
  }),
  uploadPfp: asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validImg = await validateImgFile(req.file.buffer);

    if (!validImg.valid) {
      return res.status(400).json({ message: validImg.message });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = `${req.user.id}-${crypto.randomUUID()}${ext}`;
    const filepath = path.join(PUBLIC_PATH, filename);

    // Save file
    await fs.writeFile(filepath, req.file.buffer);

    user.image = filename;
    await user.save();

    res.json({
      message: "Profile picture uploaded",
      imageUrl: filename,
    });
  }),
};

export default UserController;
