const User = require("../models/user");

const admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (user.type != "admin") {
      return res.status(401).json({
        message: "You are not an admin!",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = admin;
