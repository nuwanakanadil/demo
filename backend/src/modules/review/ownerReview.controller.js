const OwnerReview = require("./ownerReview.model");
const User = require("../auth/auth.model");
const Apparel = require("../apparel/apparel.model");

/* ==================================================
   LIST REVIEWS FOR AN OWNER
   GET /api/users/:userId/reviews

   Returns:
   - Average rating
   - Total review count
   - List of formatted reviews
================================================== */
exports.listForOwner = async (req, res, next) => {
  try {
    const { userId } = req.params; // Owner being reviewed

    // Fetch all reviews where this user is the reviewee
    const reviews = await OwnerReview.find({ revieweeId: userId })
      .populate("reviewerId", "name") // Get reviewer name
      .populate("itemId", "title")    // Get item title
      .sort({ createdAt: -1 });       // Newest first

    // Calculate average rating (rounded to 1 decimal)
    const avg =
      reviews.length === 0
        ? 0
        : Math.round(
            (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10
          ) / 10;

    // Return formatted response
    res.json({
      success: true,
      data: {
        avgRating: avg,
        count: reviews.length,
        reviews: reviews.map((r) => ({
          id: r._id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          reviewer: {
            id: r.reviewerId?._id,
            name: r.reviewerId?.name || "Unknown",
          },
          item: {
            id: r.itemId?._id,
            title: r.itemId?.title || "Item",
          },
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ==================================================
   ADD OR UPDATE REVIEW FOR OWNER
   POST /api/users/:userId/reviews

   Features:
   - Validates rating (1–5)
   - Prevents self-review
   - One review per (owner + item + reviewer)
   - Allows updating existing review (upsert)
================================================== */
exports.addForOwner = async (req, res, next) => {
  try {
    const { userId } = req.params;      // Owner being reviewed
    const reviewerId = req.user.id;     // Logged-in user

    const { rating, comment, itemId } = req.body;

    /* ---------- VALIDATION ---------- */

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "itemId is required",
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be 1-5",
      });
    }

    if (!comment || !String(comment).trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }

    // Prevent reviewing yourself
    if (String(userId) === String(reviewerId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot review yourself",
      });
    }

    /* ---------- UPSERT LOGIC ---------- */

    // If review exists for:
    // (owner + reviewer + item)
    // → update it
    // If not → create new
    let review = await OwnerReview.findOneAndUpdate(
      { revieweeId: userId, reviewerId, itemId },
      { rating, comment },
      { new: true, upsert: true }
    );

    // Keep response stable for both unit-test mocks and real mongoose docs.
    if (review && typeof review.populate === "function") {
      review = await review.populate("reviewerId", "name");
      review = await review.populate("itemId", "title");
    }

    const reviewerRef = review.reviewerId?._id || review.reviewerId?.id || review.reviewerId;
    const itemRef = review.itemId?._id || review.itemId?.id || review.itemId;

    const reviewerName = review.reviewerId?.name
      || (await User.findById(reviewerRef).select("name").lean())?.name
      || "Unknown";

    const itemTitle = review.itemId?.title
      || (await Apparel.findById(itemRef).select("title").lean())?.title
      || "Item";

    /* ---------- RESPONSE ---------- */

    res.status(201).json({
      success: true,
      data: {
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        reviewer: {
          id: reviewerRef,
          name: reviewerName,
        },
        item: {
          id: itemRef,
          title: itemTitle,
        },
      },
    });
  } catch (err) {
    // Handle unique index conflict (if schema enforces uniqueness)
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "You already reviewed this owner for this item (try updating).",
      });
    }
    next(err);
  }
};