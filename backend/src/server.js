require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("./app");
const connectDB = require("./config/db");

// chat model
const { Message } = require("./modules/chat/chat.models");

// ✅ NEW: io global store
const { setIO } = require("./socket");

connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // later restrict to frontend
    methods: ["GET", "POST"],
  },
});

// ✅ make io accessible across project
setIO(io);

// ✅ auth middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id, "User:", socket.userId);

  // ✅ NEW: user room for notifications
  socket.join(`user:${socket.userId}`);

  // ✅ chat room join
  socket.on("join_conversation", ({ conversationId }) => {
    if (!conversationId) return;
    socket.join(conversationId);
  });

  // ✅ chat message emit
  socket.on("send_message", async ({ conversationId, messageId }) => {
    try {
      if (!conversationId || !messageId) return;

      const msg = await Message.findById(messageId);
      if (!msg) return;

      io.to(conversationId).emit("message_new", msg);
    } catch (err) {
      console.error("send_message error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in .env.`);
    process.exit(1);
  }

  console.error("Server failed to start:", err.message);
  process.exit(1);
});

const gracefulShutdown = () => {
  const forceExitTimer = setTimeout(() => {
    process.exit(0);
  }, 3000);

  io.close(() => {
    server.close(async () => {
      clearTimeout(forceExitTimer);

      try {
        await mongoose.connection.close();
      } catch (err) {
        console.error("MongoDB close error:", err.message);
      }

      process.exit(0);
    });
  });
};

process.once("SIGUSR2", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

server.listen(PORT, () => {
  console.log(`Server running on ${PORT} 🚀`);
});
