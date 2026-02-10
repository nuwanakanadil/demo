const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middlewares/errorMiddleware");

const authRoutes = require("./modules/auth/auth.routes");
const swapRoutes = require("./modules/swap/swap.routes");
const apparelRoutes = require("./modules/apparel/apparel.routes");
const uploadRoutes = require("./modules/upload/upload.routes");
const chatRoutes = require("./modules/chat/chat.routes");
const ownerReviewRoutes = require("./modules/review/ownerReview.route");

const app = express();

const allowed = [
  "https://rewear-clothing-swap-platform.vercel.app",
  "http://localhost:5173",
];

const isVercelPreview = (origin) =>
  origin?.startsWith("https://rewear-clothing-swap-platform-") &&
  origin.endsWith(".vercel.app");

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowed.includes(origin) || isVercelPreview(origin)) return cb(null, true);
      return cb(new Error("CORS blocked: " + origin));
    },
    credentials: true,
  })
);
app.options("*", cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ReWear API is running 🚀");
});

// ✅ Routes FIRST
app.use("/api/auth", authRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/items", apparelRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api", ownerReviewRoutes);

// ✅ 404 (optional but good)
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ✅ Error handler LAST
app.use(errorMiddleware);

module.exports = app;
