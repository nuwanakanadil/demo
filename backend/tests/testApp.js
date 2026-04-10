const express = require("express");
const errorMiddleware = require("../src/middlewares/errorMiddleware");
const ownerReviewRoutes = require("../src/modules/review/ownerReview.route");

const app = express();

app.use(express.json());

// only mount the route under test
app.use("/api", ownerReviewRoutes);

// optional health route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Test app running" });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// error handler
app.use(errorMiddleware);

module.exports = app;