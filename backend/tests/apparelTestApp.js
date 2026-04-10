const express = require("express");
const apparelRoutes = require("../src/modules/apparel/apparel.routes");
const errorMiddleware = require("../src/middlewares/errorMiddleware");

const app = express();

app.use(express.json());
app.use("/api/items", apparelRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorMiddleware);

module.exports = app;