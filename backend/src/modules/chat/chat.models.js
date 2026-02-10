const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Apparel", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],

    // ✅ NEW: unique key to prevent duplicates
    conversationKey: { type: String, required: true, unique: true, index: true },

    lastMessageText: { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },

    lastReadAt: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        at: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true }
);

const MessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    clientMessageId: { type: String, index: true },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, clientMessageId: 1 }, { unique: true, sparse: true });

const Conversation = mongoose.model("Conversation", ConversationSchema);
const Message = mongoose.model("Message", MessageSchema);

module.exports = { Conversation, Message };
