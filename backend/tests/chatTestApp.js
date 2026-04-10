const express = require("express");
const chatRoutes = require("../src/modules/chat/chat.routes");
const errorMiddleware = require("../src/middlewares/errorMiddleware");

const app = express();

app.use(express.json());
app.use("/api/chats", chatRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorMiddleware);

module.exports = app;