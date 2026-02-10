const mongoose = require("mongoose");

const OwnerReviewSchema = new mongoose.Schema(
  {
    revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ owner being reviewed
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ who wrote review

    // optional context (nice to show "review from swap of item X")
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Apparel", required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// ✅ One review per reviewer per owner per item (prevents duplicates)
OwnerReviewSchema.index({ revieweeId: 1, reviewerId: 1, itemId: 1 }, { unique: true });

const OwnerReview = mongoose.model("OwnerReview", OwnerReviewSchema);
module.exports = OwnerReview;
