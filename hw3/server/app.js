require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// Serve Angular static files (after building client, files placed in client/dist/client)
app.use(express.static(path.join(__dirname, "../client/dist/client")));

// Route files
const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/api");
const favoritesRoutes = require("./routes/favorites");

// API Routes under /api prefix
app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/api/favorites", favoritesRoutes);

// Example /api/me endpoint (requires authentication)
const verifyToken = require("./middleware/verifyToken");
app.get("/api/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Fallback: serve Angular index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/client/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
