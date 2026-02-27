// require("dotenv").config();
// const app = require("./app");
// const connectDB = require("./config/db");

// connectDB();

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, "0.0.0.0", () => console.log(`Server running on ${PORT}`));
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const app = require("./app");
const connectDB = require("./config/db");

// ✅ IMPORTANT: make sure you created these models file
// modules/chat/chat.models.js should export { Message }
const { Message } = require("./modules/chat/chat.models");

connectDB();

const PORT = process.env.PORT || 5000;

// ✅ Create HTTP server from Express app (required for Socket.IO)
const server = http.createServer(app);

// ✅ Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // later restrict to your frontend domain
    methods: ["GET", "POST"],
  },
});

// ✅ Socket auth (uses same JWT_SECRET as your auth)
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id; // attach userId to socket
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id, "User:", socket.userId);

  // Join a conversation room
  socket.on("join_conversation", ({ conversationId }) => {
    if (!conversationId) return;
    socket.join(conversationId);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });

  // ✅ chat message emit
  socket.on("send_message", async ({ conversationId, messageId }) => {
    try {
      if (!conversationId || !messageId) return;

      const msg = await Message.findById(messageId);
      if (!msg) return;

      // send to everyone in that conversation room (including sender)
      io.to(conversationId).emit("message_new", msg);
    } catch (err) {
      console.error("send_message error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// ✅ Start server (use server.listen, NOT app.listen)
server.listen(PORT, () => {
  console.log(`Server running on ${PORT} 🚀`);
});
