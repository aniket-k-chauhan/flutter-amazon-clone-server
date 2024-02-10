require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("x-auth-token");

    if (!token)
      return res.status(401).json({ message: "No auth token, access denied." });

    const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);

    if (!verifiedToken)
      return res
        .status(401)
        .json({ message: "Token verification failed, authorization denied." });

    req.user = verifiedToken.id;
    req.token = token;

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = auth;
