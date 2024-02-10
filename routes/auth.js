require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");

const authRouter = express.Router();

authRouter.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User with same email already exists!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    let user = new User({
      email,
      password: hashedPassword,
      name,
    });

    user = await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

authRouter.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User with this email doesn't exists!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect Password!",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY);

    res.json({
      token,
      ...user._doc,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

authRouter.post("/tokenIsValid", (req, res) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) return res.json(false);

    const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);

    if (!verifiedToken) return res.json(false);

    const user = User.findById(verifiedToken.id);

    if (!user) return res.json(false);

    return res.json(true);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

authRouter.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);

    res.json({ ...user._doc, token: req.token });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = authRouter;
