const mongoose = require("mongoose");

const logisticsSchema = new mongoose.Schema(
  {
    swap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Swap",
      required: true,
      unique: true,
    },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    method: { type: String, enum: ["MEETUP", "DELIVERY"], required: true },
    meetupLocation: { type: String, trim: true, maxlength: 200, default: null },
    meetupAt: { type: Date, default: null },
    deliveryOption: { type: String, trim: true, maxlength: 80, default: null },
    trackingRef: { type: String, trim: true, maxlength: 120, default: null },
    deliveryAddress: { type: String, trim: true, maxlength: 300, default: null },
    phoneNumber: { type: String, trim: true, maxlength: 30, default: null },
    status: {
      type: String,
      enum: ["PENDING", "SCHEDULED", "IN_TRANSIT", "DONE"],
      default: "PENDING",
    },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastUpdatedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Logistics", logisticsSchema);
