import { User } from "../models/user.model.js";

export const requireAuth = async (req, res, next) => {
  const id = req.session.id;

  try {
    if (!id) return res.redirect("/");

    const user = await User.findOne({ where: { id: id } });
    console.log(user);
    if (user === null) throw new Error("Not Authorized");

    next();
  } catch (error) {
    // FIXME: add forbidden route
    res.status(403).send("Unauthorized");
  }
};
