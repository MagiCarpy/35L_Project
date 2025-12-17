import { User } from "../models/user.model.js";
import { ROOT_ENV_PATH } from "../config/paths.js";
import { ACCESS_EXP_TIME } from "../controllers/userController.js"; // FIXME: replace with redis
import redisClient from "../config/redisDb.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config({ path: ROOT_ENV_PATH });

//FIXME: for invalid, maybe also redirect to logout
const requireAuth = async (req, res, next) => {
  const accessToken = req.cookies.accessToken || null;
  const refreshToken = req.cookies.refreshToken || null;

  if (!accessToken && !refreshToken) {
    return deauth(req, res);
  }

  let user;
  try {
    const decodedAccess = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    user = await User.findByPk(decodedAccess.userId);

    if (user) console.log("USER");
  } catch (err) {
    if (!refreshToken) {
      return deauth(req, res);
    }

    // refresh the access token
    console.log("REFRESH: ");
    try {
      const decodedRefresh = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      const verifyRefreshToken = await redisClient.get(decodedRefresh.userId);
      // console.log(verifyRefresh);
      // FIXME: let redis handle removal of expired refresh token rather than explicit check
      if (!verifyRefreshToken) return deauth();

      if (refreshToken !== verifyRefreshToken)
        return res.status(401).json({ error: "Bad refresh token" });

      const newAccessToken = jwt.sign(
        { userId: decodedRefresh.userId },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: ACCESS_EXP_TIME,
        }
      );

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: ACCESS_EXP_TIME * 1000,
      });

      user = await User.findByPk(decodedRefresh.userId);
    } catch (error) {
      return res.status(400).json({ error: "Auth failed" });
    }
  }

  if (!user) return res.status(404).json({ error: "User not found" });

  req.user = user;
  next();
};

function deauth(req, res) {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return res.status(401).json({ error: "Unauthorized" });
}

export default requireAuth;
