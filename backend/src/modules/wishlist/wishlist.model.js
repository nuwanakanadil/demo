const mongoose = require("mongoose");

const savedSearchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    filters: {
      category: { type: String, default: "all" },
      size: { type: String, default: "all" },
      condition: { type: String, default: "all" },
      dateFrom: { type: String, default: "" },
      dateTo: { type: String, default: "" },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    itemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Apparel" }],
    savedSearches: [savedSearchSchema],
  },
  {
    timestamps: true,
    collection: "Wishlist",
  }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
//complete