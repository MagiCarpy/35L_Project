// backend/controllers/userController.js
import bcrypt from "bcrypt";
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/user.model.js";

const saltRounds = 10;

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const exists = await User.findOne({ where: { email } });
  if (exists) {
    return res.status(409).json({ message: "Email already registered." });
  }

  // ✅ IMPORTANT FIX: save hashed password
  const hashed = bcrypt.hashSync(password, saltRounds);

  await User.create({
    username,
    email,
    password: hashed,   // <-- FIX
  });

  res.status(200).json({
    message: "User registered successfully.",
  });
});

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // store authenticated user ID in session
    req.session.userId = user.id;

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const logoutUser = asyncHandler(async (req, res) => {
  req.session = null;
  res.status(200).json({ message: "Logged out successfully." });
});

export const getProfile = asyncHandler(async (req, res) => {
  // ❌ old: req.session.user (always undefined)
  // ✅ fix:
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not logged in." });
  }

  const user = await User.findOne({ where: { id: req.session.userId } });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  res.status(200).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
});
