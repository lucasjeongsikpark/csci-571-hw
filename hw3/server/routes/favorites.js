const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const User = require("../models/User");

router.use(verifyToken);

// Add favorite artist
router.post("/add", async (req, res) => {
  try {
    const { artistId } = req.body;
    const user = await User.findById(req.user.id);
    if (user.favorites.some((fav) => fav.artistId === artistId)) {
      return res.status(400).json({ error: "Artist already in favorites" });
    }
    user.favorites.push({ artistId });
    await user.save();
    res.json({ message: "Added to favorites", favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove favorite artist
router.post("/remove", async (req, res) => {
  try {
    const { artistId } = req.body;
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter((fav) => fav.artistId !== artistId);
    await user.save();
    res.json({ message: "Removed from favorites", favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get favorite artists
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
