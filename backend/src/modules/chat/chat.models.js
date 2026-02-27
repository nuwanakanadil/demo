const mongoose = require("mongoose");

/* ==================================================
   CONVERSATION SCHEMA
   - Represents a chat between two users about one item
   - Prevents duplicate conversations using conversationKey
================================================== */
const ConversationSchema = new mongoose.Schema(
  {
    /* ---------------- RELATED ITEM ---------------- */

    // The item being discussed in this chat
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apparel",
      required: true,
    },

    /* ---------------- PARTICIPANTS ---------------- */

    // Users involved in the conversation (2 users)
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    /* ---------------- UNIQUE CONVERSATION KEY ---------------- */

    // conversationKey ensures:
    // - Only one conversation per (item + user pair)
    // - Prevents duplicates even if API called twice
    conversationKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /* ---------------- INBOX PREVIEW FIELDS ---------------- */

    // Stores last message text (for inbox preview)
    lastMessageText: { type: String, default: "" },

    // Stores timestamp of last message (for sorting inbox)
    lastMessageAt: { type: Date, default: null },

    /* ---------------- READ TRACKING ---------------- */

    // Array storing read status per user
    // Each user has:
    // - userId
    // - last time they opened/read the conversation
    lastReadAt: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        at: { type: Date, default: null },
      },
    ],
  },
  {
    // Automatically adds:
    // - createdAt
    // - updatedAt
    timestamps: true,
  }
);

/* ==================================================
   MESSAGE SCHEMA
   - Represents a single message in a conversation
================================================== */
const MessageSchema = new mongoose.Schema(
  {
    // Reference to parent conversation
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    // User who sent the message
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Message content
    text: {
      type: String,
      required: true,
    },

    // Used for optimistic UI updates:
    // - Prevents duplicate message insertion
    // - Matches frontend temporary message with real DB message
    clientMessageId: {
      type: String,
      index: true,
    },
  },
  {
    // Adds createdAt & updatedAt automatically
    timestamps: true,
  }
);

/* ==================================================
   UNIQUE MESSAGE INDEX
   - Ensures:
     (conversationId + clientMessageId) is unique
   - Prevents duplicate messages if user double-clicks send
   - sparse: true → allows documents without clientMessageId
================================================== */
MessageSchema.index(
  { conversationId: 1, clientMessageId: 1 },
  { unique: true, sparse: true }
);

/* ==================================================
   EXPORT MODELS
================================================== */
const Conversation = mongoose.model("Conversation", ConversationSchema);
const Message = mongoose.model("Message", MessageSchema);

module.exports = { Conversation, Message };