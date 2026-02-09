const mongoose = require("mongoose");

const apparelSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 500 },

    category: {
      type: String,
      enum: ["TOP", "BOTTOM", "DRESS", "OUTERWEAR", "SHOES", "ACCESSORY", "OTHER"],
      default: "OTHER",
    },

    size: { type: String, required: true, trim: true, maxlength: 10 },

    condition: {
      type: String,
      enum: ["NEW", "LIKE_NEW", "GOOD", "FAIR", "WORN"],
      default: "GOOD",
    },

    images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true }
    }
    ],

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

apparelSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Apparel", apparelSchema);
