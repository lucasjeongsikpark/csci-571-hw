const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");

// Registration endpoint
router.post("/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate Gravatar URL using MD5 hash of the email
    const emailHash = crypto
      .createHash("md5")
      .update(email.trim().toLowerCase())
      .digest("hex");
    const profileImageUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;

    const user = new User({
      fullname,
      email,
      password: hashedPassword,
      profileImageUrl,
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
    res.json({
      message: "Registration successful",
      user: {
        fullname: user.fullname,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "All fields are required" });
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
    res.json({
      message: "Login successful",
      user: {
        fullname: user.fullname,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        favorites: user.favorites,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Logout endpoint
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// Delete account endpoint
router.delete("/delete", verifyToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.clearCookie("token");
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
