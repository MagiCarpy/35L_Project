import { con } from "../config/db.js";
import asyncHandler from "express-async-handler"; // allows for easy error routing (less try and catch)
import bcrypt from "bcrypt";

// Add the all the database user table interactions to be used in the user routes
// ex. create user, delete user, get all users, etc

// add body parameter validation later (express-validator)

const saltRounds = 10;

const User = {
  register: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?);`;
    try {
      await con.execute(query, [username, email, hashedPassword]);
      return res.json({
        message: "User registered successfully",
        user: {
          username: username,
          email: email,
          password: password,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to create user." });
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

    const query = `SELECT * FROM users WHERE email = ?;`;
    const [result, rows] = await con.execute(query, [email]);
    if (result.length === 0)
      return res
        .status(401)
        .json({ success: false, message: "User login failed. No user found." });
    const isValidUser = bcrypt.compareSync(password, result[0].PASSWORD);

    if (isValidUser)
      return res
        .status(200)
        .json({ success: true, message: "User logged in." });
    else
      return res.status(401).json({
        success: false,
        message: "User login failed. Bad credentials.",
      });
  }),
};

export default User;
