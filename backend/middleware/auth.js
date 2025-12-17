import { User } from "../models/user.model.js";
import { ROOT_ENV_PATH } from "../config/paths.js";
import { refreshDict, ACCESS_EXP_TIME } from "../controllers/userController.js"; // FIXME: replace with redis
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config({ path: ROOT_ENV_PATH });

//FIXME: for invalid, maybe also redirect to logout
const requireAuth = async (req, res, next) => {
  console.log("DICT: ", refreshDict);
  const accessToken = req.cookies.accessToken || null;
  const refreshToken = req.cookies.refreshToken || null;

  if (!accessToken && !refreshToken) {
    return deauth(req, res);
  }

  let user;
  try {
    const decodedAccess = jwt.verify(accessToken, process.env.SESSION_SECRET);

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
        process.env.SESSION_SECRET
      );
      const verifyRefreshToken = refreshDict[decodedRefresh.userId];

      // FIXME: let redis handle removal of expired refresh token rather than explicit check
      if (!verifyRefreshToken)
        return res.status(404).json({ error: "Refresh token not saved" });

      if (refreshToken !== verifyRefreshToken)
        return res.status(401).json({ error: "Bad refresh token" });

      const newAccessToken = jwt.sign(
        { userId: decodedRefresh.userId },
        process.env.SESSION_SECRET,
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
  for (const key in refreshDict) {
    if (refreshDict[key] === req.cookies.refreshToken) {
      delete refreshDict[key]; // Delete the property if the value matches
    }
  }

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
