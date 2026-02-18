const User = require("../auth/auth.model");

// ---------------- USERS ----------------
exports.getAllUsers = async (req, res, next) => {
  try {
    const { accountStatus, role } = req.query;
    let filter = {};
    if (accountStatus) filter.accountStatus = accountStatus;
    if (role) filter.role = role;

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ---------------- ADMIN ACTIONS ----------------
exports.suspendUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { accountStatus: "suspended" });
    res.json({ success: true, message: "User suspended successfully" });
  } catch (err) {
    next(err);
  }
};

exports.banUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { accountStatus: "banned" });
    res.json({ success: true, message: "User banned successfully" });
  } catch (err) {
    next(err);
  }
};

exports.activateUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { accountStatus: "active" });
    res.json({ success: true, message: "User activated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.manualVerifyEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new Error("User not found");
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: "Email verified manually" });
  } catch (err) {
    next(err);
  }
};

// ---------------- ITEMS ----------------
// Get all items
exports.getAllItems = async (req, res, next) => {
  try {
    const items = await Item.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};


// Block / Unblock item
exports.updateItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // blocked, active, unavailable

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: "Item not found" });

    res.status(200).json({ success: true, message: "Item updated", data: item });
  } catch (err) {
    next(err);
  }
};


// Delete item
exports.deleteItem = async (req, res, next) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Item deleted" });
  } catch (err) {
    next(err);
  }
};

// ---------------- SWAPS ----------------
// Get all swaps
exports.getAllSwaps = async (req, res, next) => {
  try {
    const swaps = await Swap.find()
      .populate("requester", "name email")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: swaps });
  } catch (err) {
    next(err);
  }
};


// Update swap status
exports.updateSwapStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // cancelled, completed, locked

    const swap = await Swap.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!swap) return res.status(404).json({ message: "Swap not found" });

    res.status(200).json({ success: true, message: "Swap updated", data: swap });
  } catch (err) {
    next(err);
  }
};

// ---------------- REVIEWS ----------------
// Get all reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate("reviewer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};


// Delete review
exports.deleteReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};

// ---------------- REPORTS ----------------
// Get all reports
exports.getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
};


// Mark report resolved
exports.resolveReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Report resolved" });
  } catch (err) {
    next(err);
  }
};
