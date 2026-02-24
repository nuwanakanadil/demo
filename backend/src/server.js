require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

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

  transporter.verify((err) => {
    console.log("SMTP verify:", err ? err.message : "✅ SMTP ready");
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

server.listen(PORT, () => {
  console.log(`Server running on ${PORT} 🚀`);
});
