const mongoose = require("mongoose");

const swapSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    requestedItem: { type: mongoose.Schema.Types.ObjectId, ref: "Apparel", required: true },
    offeredItem: { type: mongoose.Schema.Types.ObjectId, ref: "Apparel", required: true },

    message: { type: String, trim: true, maxlength: 500 },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

// Helps prevent duplicates (basic)
swapSchema.index({ requester: 1, requestedItem: 1, status: 1 });

module.exports = mongoose.model("Swap", swapSchema);
