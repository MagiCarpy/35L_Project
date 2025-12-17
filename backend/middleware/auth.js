import { User } from "../models/user.model.js";
import { ROOT_ENV_PATH } from "../config/paths.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config({ path: ROOT_ENV_PATH });

const requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt || null;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decodedToken = jwt.verify(token, process.env.SESSION_SECRET);
    console.log(decodedToken.userId);
    const user = await User.findByPk(decodedToken.userId);

    if (!user) {
      req.clearCookie("jwt");
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    req.user = null;
    return res.status(400).json({ error: "Auth failed" });
  }
};

export default requireAuth;
