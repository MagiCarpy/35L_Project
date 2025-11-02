import { User } from "../models/user.model.js";

export const requireAuth = async (req, res, next) => {
  const sessionId = req.session.id;

  try {
    if (!sessionId) return res.redirect("/");

    const user = await User.findOne({ where: { id: sessionId } });
    console.log(user);
    if (user === null) throw new Error("Unauthorized");

    next();
  } catch (error) {
    // FIXME: add forbidden route
    res.status(403).send("Unauthorized");
  }
};
