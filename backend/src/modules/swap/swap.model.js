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
    logistics: {
      method: { type: String, enum: ["MEETUP", "DELIVERY"] },
      meetupLocation: { type: String, trim: true, maxlength: 200 },
      meetupAt: { type: Date },
      deliveryOption: { type: String, trim: true, maxlength: 80 },
      trackingRef: { type: String, trim: true, maxlength: 120 },
      deliveryAddress: { type: String, trim: true, maxlength: 300 },
      phoneNumber: { type: String, trim: true, maxlength: 30 },
      status: {
        type: String,
        enum: ["PENDING", "SCHEDULED", "IN_TRANSIT", "DONE"],
        default: "PENDING",
      },
      lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      lastUpdatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Helps prevent duplicates (basic)
swapSchema.index({ requester: 1, requestedItem: 1, status: 1 });

module.exports = mongoose.model("Swap", swapSchema);
