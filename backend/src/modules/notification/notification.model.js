const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // receiver

    type: {
      type: String,
      enum: ["SWAP_REQUEST", "SWAP_ACCEPTED", "SWAP_REJECTED", "SWAP_COMPLETED", "CHAT_MESSAGE"],
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, default: "" },

    link: { type: String, default: "" }, // e.g. "/swaps/incoming"
    meta: { type: Object, default: {} }, // extra data if needed

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
