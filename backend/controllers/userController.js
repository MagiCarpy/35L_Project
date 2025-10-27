import { con } from "../config/db.js";
import asyncHandler from "express-async-handler"; // allows for easy error routing (less try and catch)
import bcrypt from "bcrypt";

// Add the all the database user table interactions to be used in the user routes
// ex. create user, delete user, get all users, etc

// add body parameter validation later (express-validator)

const saltRounds = 10;

const User = {
  create: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?);`;
    try {
      await con.execute(query, [username, email, hashedPassword]);
      res.json({
        message: "User registered successfully",
        user: {
          username: username,
          email: email,
          password: password,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user." });
    }
  }),
};

export default User;
