const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middlewares/errorMiddleware");

const authRoutes = require("./modules/auth/auth.routes");
const swapRoutes = require("./modules/swap/swap.routes");
const apparelRoutes = require("./modules/apparel/apparel.routes");
const uploadRoutes = require("./modules/upload/upload.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ReWear API is running 🚀");
});

// ✅ Routes FIRST
app.use("/api/auth", authRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/items", apparelRoutes);
app.use("/api/uploads", uploadRoutes);

// ✅ 404 (optional but good)
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ✅ Error handler LAST
app.use(errorMiddleware);

module.exports = app;
