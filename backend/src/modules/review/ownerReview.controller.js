const OwnerReview = require("./ownerReview.model");

// GET /api/users/:userId/reviews
exports.listForOwner = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const reviews = await OwnerReview.find({ revieweeId: userId })
      .populate("reviewerId", "name")
      .populate("itemId", "title")
      .sort({ createdAt: -1 });

    const avg =
      reviews.length === 0
        ? 0
        : Math.round(
            (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10
          ) / 10;

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
          reviewer: { id: r.reviewerId?._id, name: r.reviewerId?.name || "Unknown" },
          item: { id: r.itemId?._id, title: r.itemId?.title || "Item" },
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/:userId/reviews
exports.addForOwner = async (req, res, next) => {
  try {
    const { userId } = req.params; // revieweeId (owner)
    const reviewerId = req.user.id;

    const { rating, comment, itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({ success: false, message: "itemId is required" });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be 1-5" });
    }
    if (!comment || !String(comment).trim()) {
      return res.status(400).json({ success: false, message: "Comment is required" });
    }

    if (String(userId) === String(reviewerId)) {
      return res.status(400).json({ success: false, message: "You cannot review yourself" });
    }

    // ✅ Upsert: allow update if user posts again for same owner+item
    const review = await OwnerReview.findOneAndUpdate(
      { revieweeId: userId, reviewerId, itemId },
      { rating, comment },
      { new: true, upsert: true }
    )
      .populate("reviewerId", "name")
      .populate("itemId", "title");

    res.status(201).json({
      success: true,
      data: {
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        reviewer: { id: review.reviewerId?._id, name: review.reviewerId?.name || "Unknown" },
        item: { id: review.itemId?._id, title: review.itemId?.title || "Item" },
      },
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You already reviewed this owner for this item (try updating).",
      });
    }
    next(err);
  }
};
