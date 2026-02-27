const mongoose = require("mongoose");

/* ==================================================
   OWNER REVIEW SCHEMA
   - Stores reviews written ABOUT a user (owner)
   - Linked to:
       • reviewee (owner being reviewed)
       • reviewer (who wrote it)
       • item (context of the review)
================================================== */
const OwnerReviewSchema = new mongoose.Schema(
  {
    /* ---------------- REVIEW TARGET ---------------- */

    // The owner being reviewed
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ---------------- REVIEW AUTHOR ---------------- */

    // The user who wrote the review
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ---------------- CONTEXT ITEM ---------------- */

    // Item related to this review
    // Helps display:
    // "Review from swap of item X"
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apparel",
      required: true,
    },

    /* ---------------- RATING DATA ---------------- */

    // Rating score (1–5 stars)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Written review (max 1000 characters)
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    // Automatically adds:
    // createdAt
    // updatedAt
    timestamps: true,
  }
);

/* ==================================================
   UNIQUE CONSTRAINT
   - Prevents duplicate reviews
   - Ensures:
       One reviewer can review
       One owner
       For one specific item
   - If posted again → controller upsert updates instead
================================================== */
OwnerReviewSchema.index(
  { revieweeId: 1, reviewerId: 1, itemId: 1 },
  { unique: true }
);

const OwnerReview = mongoose.model("OwnerReview", OwnerReviewSchema);

module.exports = OwnerReview;