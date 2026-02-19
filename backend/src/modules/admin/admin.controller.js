// import { find, findByIdAndDelete, findByIdAndUpdate, findById } from "../auth/auth.model";
import Apparel from "../apparel/apparel.model.js";
import User from "../auth/auth.model.js";
import OwnerReview from "../review/ownerReview.model.js";

// ---------------- USERS ----------------
export const getAllUsers = async (req, res, next) => {
  try {
    const { accountStatus, role } = req.query;
    let filter = {};

    if (accountStatus) {
      filter.accountStatus = accountStatus;
    }

    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select("-password") 
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (err) {
    next(err);
  }
};


// export async function deleteUser(req, res, next) {
//   try {
//     await findByIdAndDelete(req.params.id);
//     res.json({ success: true, message: "User deleted successfully" });
//   } catch (err) {
//     next(err);
//   }
// }

// // ---------------- ADMIN ACTIONS ----------------
// export async function suspendUser(req, res, next) {
//   try {
//     await findByIdAndUpdate(req.params.id, { accountStatus: "suspended" });
//     res.json({ success: true, message: "User suspended successfully" });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function banUser(req, res, next) {
//   try {
//     await findByIdAndUpdate(req.params.id, { accountStatus: "banned" });
//     res.json({ success: true, message: "User banned successfully" });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function activateUser(req, res, next) {
//   try {
//     await findByIdAndUpdate(req.params.id, { accountStatus: "active" });
//     res.json({ success: true, message: "User activated successfully" });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function manualVerifyEmail(req, res, next) {
//   try {
//     const user = await findById(req.params.id);
//     if (!user) throw new Error("User not found");
//     user.isEmailVerified = true;
//     await user.save({ validateBeforeSave: false });
//     res.json({ success: true, message: "Email verified manually" });
//   } catch (err) {
//     next(err);
//   }
// }

// ---------------- ITEMS ----------------
// Get all items
export async function getAllItems(req, res, next) {
  try {
    const items = await Apparel.find();
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}


//Block / Unblock item
export async function updateItemStatus(req, res, next) {
    try {
    const { block } = req.body; // blocked, active, unavailable

    const item = await Apparel.findByIdAndUpdate(
      req.params.id,
      { isBlocked: block },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: "Item not found" });

    res.status(200).json({
      success: true,
      message: `Item ${block ? "blocked" : "unblocked"}`,
      data: item,
    });
  } catch (err) {
    next(err);
  }
}


// Delete item
export async function deleteItem(req, res, next) {
  try {
    const item = await Apparel.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Item deleted successfully"
    });

  } catch (err) {
    next(err);
  }
}
// // ---------------- SWAPS ----------------
// // Get all swaps
// export async function getAllSwaps(req, res, next) {
//   try {
//     const swaps = await Swap.find()
//       .populate("requester", "name email")
//       .populate("owner", "name email")
//       .sort({ createdAt: -1 });

//     res.status(200).json({ success: true, data: swaps });
//   } catch (err) {
//     next(err);
//   }
// }


// // Update swap status
// export async function updateSwapStatus(req, res, next) {
//   try {
//     const { status } = req.body; // cancelled, completed, locked

//     const swap = await Swap.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );

//     if (!swap) return res.status(404).json({ message: "Swap not found" });

//     res.status(200).json({ success: true, message: "Swap updated", data: swap });
//   } catch (err) {
//     next(err);
//   }
// }

// // ---------------- REVIEWS ----------------
// Get all reviews
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await OwnerReview.find()
      .populate("reviewerId", "name email")
      .populate("revieweeId", "name email")
      .populate("itemId", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });

  } catch (err) {
    next(err);
  }
}


//  Delete review
export async function deleteReview(req, res, next) {
  try {
    const review = await OwnerReview.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });

  } catch (err) {
    next(err);
  }
}

// // ---------------- REPORTS ----------------
// // Get all reports
// export async function getAllReports(req, res, next) {
//   try {
//     const reports = await Report.find()
//       .populate("reportedBy", "name email")
//       .sort({ createdAt: -1 });

//     res.status(200).json({ success: true, data: reports });
//   } catch (err) {
//     next(err);
//   }
// }


// // Mark report resolved
// export async function resolveReport(req, res, next) {
//   try {
//     const report = await Report.findByIdAndUpdate(
//       req.params.id,
//       { status: "resolved" },
//       { new: true }
//     );

//     res.status(200).json({ success: true, message: "Report resolved" });
//   } catch (err) {
//     next(err);
//   }
// }
