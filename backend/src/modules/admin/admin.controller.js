import Apparel from "../apparel/apparel.model.js";
import User from "../auth/auth.model.js";
import OwnerReview from "../review/ownerReview.model.js";
import deleteFromCloudinary from "../../utils/cloudinaryDelete.js";
import Swap from "../swap/swap.model.js";
import bcrypt from "bcryptjs";
import Notification from "../notification/notification.model.js";
import AdminAudit from "./adminAudit.model.js";

const logAdminAction = async ({ actorId, action, targetType, targetId, targetLabel, meta = {} }) => {
  try {
    await AdminAudit.create({
      actorId,
      action,
      targetType,
      targetId: targetId ? String(targetId) : "",
      targetLabel: targetLabel || "",
      meta,
    });
  } catch (err) {
    console.error("Admin audit log failed:", err.message);
  }
};
// ---------------- USERS ----------------
export const getAllUsers = async (req, res, next) => {
  try {

    if (req.query.email) {
      const user = await User.findOne({
        email: req.query.email.toLowerCase().trim(),
        role: "user"
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = { role: "user" };

    if (req.query.status) {
      filter.accountStatus = req.query.status;
    }

    const totalUsers = await User.countDocuments(filter);

    const userList = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      count: userList.length,
      data: userList
    });

  } catch (error) {
    next(error);
  }
};

//create user

export const createUserByAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      isVerified: true,   
      accountStatus: "active"
    });

    await newUser.save();

    await logAdminAction({
      actorId: req.user.id,
      action: "CREATE_USER",
      targetType: "user",
      targetId: newUser._id,
      targetLabel: newUser.email,
      meta: { role: newUser.role },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully by admin",
      data: newUser
    });

  } catch (error) {
    next(error);
  }
};

//suspend user

//suspend user

export const suspendUser = async (req, res, next) => {
  try {
    const { duration } = req.body; // allowed: 7, 30, or "permanent"

    const allowedDurations = [7, 30];
    let statusUpdate = { accountStatus: "suspended", suspensionEnd: null };

    if (duration === "permanent") {
      statusUpdate.accountStatus = "banned";
    } else {
      const days = Number(duration);

      if (!Number.isInteger(days) || !allowedDurations.includes(days)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid duration. Allowed values are 7, 30, or "permanent".',
        });
      }

      statusUpdate.suspensionEnd = new Date(
        Date.now() + days * 24 * 60 * 60 * 1000
      );
    }

    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      statusUpdate,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Apparel.updateMany(
      { owner: user._id },
      { $set: { isBlocked: true } }
    );

    await logAdminAction({
      actorId: req.user.id,
      action: statusUpdate.accountStatus === "banned" ? "BAN_USER" : "SUSPEND_USER",
      targetType: "user",
      targetId: user._id,
      targetLabel: user.email,
      meta: { duration, suspensionEnd: statusUpdate.suspensionEnd },
    });

    res.status(200).json({
      success: true,
      message:
        statusUpdate.accountStatus === "banned"
          ? "User banned and all items blocked"
          : "User suspended and all items blocked",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//active user
export const activeUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { accountStatus: "active", suspensionEnd: null },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await Apparel.updateMany(
      { owner: user._id },
      { $set: { isBlocked: false } }
    );

    await logAdminAction({
      actorId: req.user.id,
      action: "ACTIVATE_USER",
      targetType: "user",
      targetId: user._id,
      targetLabel: user.email,
    });

    res.status(200).json({
      success: true,
      message: "User activated and all items unblocked",
      data: user
    });

  } catch (error) {
    next(error);
  }
};


// ---------------- ITEMS ----------------
// Get all items
export async function getAllItems(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.title) {
      filter.title = { $regex: req.query.title, $options: "i" };
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.condition) {
      filter.condition = req.query.condition;
    }

    if (typeof req.query.blocked !== "undefined") {
      filter.isBlocked = String(req.query.blocked).toLowerCase() === "true";
    }

    if(req.query.email){
      const user = await User.findOne({email:req.query.email});
      if(!user){
        return res.status(404).json({
          success:false,
          message:"user not found"

        });
      }
      filter.owner=user._id;
    }

    let query = Apparel.find(filter).populate("owner", "name email");

    const totalItems = await Apparel.countDocuments(filter);

    const items = await query
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      count: items.length,
      data: items
    });

  } catch (err) {
    next(err);
  }
}





//Block / Unblock item
export async function updateItemStatus(req, res, next) {
  try {
    const { block } = req.body;

    if (typeof block !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "block must be true or false"
      });
    }

    const item = await Apparel.findByIdAndUpdate(
      req.params.id,
      { isBlocked: block },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    if (block) {
      try {
         await Notification.create({
           user: item.owner,
           type: "ITEM_BLOCKED",
           title: "Apparel Blocked",
           message: `Your apparel "${item.title}" was blocked by the admin. Please contact support if you believe this is a mistake.`
         });
      } catch (e) {
        console.error("Failed to create ITEM_BLOCKED notification", e);
      }
    }

    await logAdminAction({
      actorId: req.user.id,
      action: block ? "BLOCK_ITEM" : "UNBLOCK_ITEM",
      targetType: "item",
      targetId: item._id,
      targetLabel: item.title,
    });

    res.status(200).json({
      success: true,
      message: `Item ${block ? "blocked" : "unblocked"}`,
      data: item
    });

  } catch (err) {
    next(err);
  }
}



// Delete item
export const deleteItem = async (req, res, next) => {
  try {
    const item = await Apparel.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    // Delete images from Cloudinary first
    for (const image of item.images) {
      await deleteFromCloudinary(image.public_id);
    }

    try {
       await Notification.create({
         user: item.owner,
         type: "ITEM_REMOVED",
         title: "Apparel Removed",
         message: `Your apparel "${item.title}" was removed by the admin because it is not suitable for this platform.`
       });
    } catch (e) {
      console.error("Failed to create ITEM_REMOVED notification", e);
    }

    await item.deleteOne();

    await logAdminAction({
      actorId: req.user.id,
      action: "DELETE_ITEM",
      targetType: "item",
      targetId: item._id,
      targetLabel: item.title,
    });

    res.status(200).json({
      success: true,
      message: "Item removed successfully"
    });

  } catch (error) {
    next(error);
  }
};

// // ---------------- SWAPS ----------------
// Get all swaps
export async function getAllSwaps(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.stage === "in-logistics") {
      filter.$or = [
        { "logistics.status": { $in: ["SCHEDULED", "IN_TRANSIT", "DONE"] } },
        { status: "COMPLETED" },
      ];
      delete filter.status;
    }

    // Filter by requester email
    let requesterUser = null;
    if (req.query.requesterEmail) {
      requesterUser = await User.findOne({
        email: req.query.requesterEmail.toLowerCase().trim()
      });

      if (!requesterUser) {
        return res.status(404).json({
          success: false,
          message: "Requester not found"
        });
      }

      filter.requester = requesterUser._id;
    }

    // Filter by owner email
    let ownerUser = null;
    if (req.query.ownerEmail) {
      ownerUser = await User.findOne({
        email: req.query.ownerEmail.toLowerCase().trim()
      });

      if (!ownerUser) {
        return res.status(404).json({
          success: false,
          message: "Owner not found"
        });
      }

      filter.owner = ownerUser._id;
    }

    const totalSwaps = await Swap.countDocuments(filter);

    const swaps = await Swap.find(filter)
      .populate("requester", "name email")
      .populate("owner", "name email")
      .populate("requestedItem")
      .populate("offeredItem")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalSwaps / limit),
      totalSwaps,
      count: swaps.length,
      data: swaps
    });

  } catch (err) {
    next(err);
  }
}


export async function getAllReviews(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by reviewee email
    if (req.query.revieweeEmail) {
      const reviewee = await User.findOne({
        email: req.query.revieweeEmail.toLowerCase().trim()
      });

      if (!reviewee) {
        return res.status(404).json({
          success: false,
          message: "Reviewee not found"
        });
      }

      filter.revieweeId = reviewee._id;
    }

    // Filter by reviewer email
    if (req.query.reviewerEmail) {
      const reviewer = await User.findOne({
        email: req.query.reviewerEmail.toLowerCase().trim()
      });

      if (!reviewer) {
        return res.status(404).json({
          success: false,
          message: "Reviewer not found"
        });
      }

      filter.reviewerId = reviewer._id;
    }

    const totalReviews = await OwnerReview.countDocuments(filter);

    const reviews = await OwnerReview.find(filter)
      .populate("revieweeId", "name email")
      .populate("reviewerId", "name email")
      .populate("itemId", "title images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalReviews / limit),
      totalReviews,
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

    await logAdminAction({
      actorId: req.user.id,
      action: "DELETE_REVIEW",
      targetType: "review",
      targetId: review._id,
      targetLabel: review.comment?.slice(0, 40) || "review",
    });

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });

  } catch (err) {
    next(err);
  }
}

export const bulkUserStatus = async (req, res, next) => {
  try {
    const { emails = [], action = "suspend", duration = 7 } = req.body || {};
    const normalizedEmails = Array.isArray(emails)
      ? emails.map((x) => String(x).trim().toLowerCase()).filter(Boolean)
      : [];

    if (normalizedEmails.length === 0) {
      return res.status(400).json({ success: false, message: "No user emails provided" });
    }

    const update = action === "activate"
      ? { accountStatus: "active", suspensionEnd: null }
      : {
          accountStatus: duration === "permanent" ? "banned" : "suspended",
          suspensionEnd: duration === "permanent" ? null : new Date(Date.now() + Number(duration) * 24 * 60 * 60 * 1000),
        };

    const result = await User.updateMany({ email: { $in: normalizedEmails }, role: "user" }, { $set: update });
    const users = await User.find({ email: { $in: normalizedEmails }, role: "user" }).select("_id email");

    if (action === "activate") {
      await Apparel.updateMany({ owner: { $in: users.map((u) => u._id) } }, { $set: { isBlocked: false } });
    } else {
      await Apparel.updateMany({ owner: { $in: users.map((u) => u._id) } }, { $set: { isBlocked: true } });
    }

    await logAdminAction({
      actorId: req.user.id,
      action: action === "activate" ? "BULK_ACTIVATE_USERS" : "BULK_SUSPEND_USERS",
      targetType: "user",
      targetLabel: `${users.length} users`,
      meta: { emails: normalizedEmails, duration },
    });

    res.status(200).json({ success: true, modifiedCount: result.modifiedCount || 0 });
  } catch (error) {
    next(error);
  }
};

export const bulkItemBlock = async (req, res, next) => {
  try {
    const { itemIds = [], block = true } = req.body || {};
    const ids = Array.isArray(itemIds) ? itemIds.filter(Boolean) : [];

    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "No item IDs provided" });
    }

    const result = await Apparel.updateMany({ _id: { $in: ids } }, { $set: { isBlocked: !!block } });

    await logAdminAction({
      actorId: req.user.id,
      action: block ? "BULK_BLOCK_ITEMS" : "BULK_UNBLOCK_ITEMS",
      targetType: "item",
      targetLabel: `${ids.length} items`,
      meta: { itemIds: ids },
    });

    res.status(200).json({ success: true, modifiedCount: result.modifiedCount || 0 });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const q = (req.query.q || "").toString().trim();
    const action = (req.query.action || "").toString().trim();

    const filter = {};
    if (q) {
      filter.$or = [
        { targetLabel: { $regex: q, $options: "i" } },
        { action: { $regex: q, $options: "i" } },
      ];
    }
    if (action) {
      filter.action = action;
    }

    const total = await AdminAudit.countDocuments(filter);
    const logs = await AdminAudit.find(filter)
      .populate("actorId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

//from admin dashboard
export const getAdminDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const requestedRange = Number(req.query.rangeDays) || 30;
    const allowedRanges = [7, 30, 90];
    const rangeDays = allowedRanges.includes(requestedRange) ? requestedRange : 30;

    const start = new Date(now);
    start.setDate(start.getDate() - rangeDays);

    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - rangeDays);

    const currentRangeFilter = { $gte: start, $lte: now };
    const previousRangeFilter = { $gte: previousStart, $lt: start };

    const [
      totalUsers,
      totalItems,
      totalSwaps,
      totalReviews,
      usersCurrent,
      usersPrevious,
      itemsCurrent,
      itemsPrevious,
      swapsCurrent,
      swapsPrevious,
      reviewsCurrent,
      reviewsPrevious,
      blockedItems,
      suspendedUsers,
      unreadModerationAlerts,
      funnelRequested,
      funnelAccepted,
      funnelInLogistics,
      funnelCompleted,
      recentSwaps,
      recentModerationNotifications,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Apparel.countDocuments(),
      Swap.countDocuments(),
      OwnerReview.countDocuments(),

      User.countDocuments({ role: "user", createdAt: currentRangeFilter }),
      User.countDocuments({ role: "user", createdAt: previousRangeFilter }),
      Apparel.countDocuments({ createdAt: currentRangeFilter }),
      Apparel.countDocuments({ createdAt: previousRangeFilter }),
      Swap.countDocuments({ createdAt: currentRangeFilter }),
      Swap.countDocuments({ createdAt: previousRangeFilter }),
      OwnerReview.countDocuments({ createdAt: currentRangeFilter }),
      OwnerReview.countDocuments({ createdAt: previousRangeFilter }),

      Apparel.countDocuments({ isBlocked: true }),
      User.countDocuments({ role: "user", accountStatus: { $in: ["suspended", "banned"] } }),
      Notification.countDocuments({
        isRead: false,
        type: { $in: ["ITEM_BLOCKED", "ITEM_REMOVED"] },
      }),

      Swap.countDocuments({ status: "PENDING" }),
      Swap.countDocuments({ status: "ACCEPTED" }),
      Swap.countDocuments({
        $or: [
          { "logistics.status": { $in: ["SCHEDULED", "IN_TRANSIT", "DONE"] } },
          { status: "COMPLETED" },
        ],
      }),
      Swap.countDocuments({ status: "COMPLETED" }),

      Swap.find({})
        .populate("requester", "name")
        .populate("owner", "name")
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),

      Notification.find({ type: { $in: ["ITEM_BLOCKED", "ITEM_REMOVED"] } })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const buildTrend = (current, previous) => {
      const delta = current - previous;
      const deltaPct = previous === 0 ? (current > 0 ? 100 : 0) : Number(((delta / previous) * 100).toFixed(1));
      return { current, previous, delta, deltaPct };
    };

    const swapActivity = recentSwaps.map((s) => ({
      id: String(s._id),
      type: "swap",
      title: `Swap ${String(s.status || "PENDING").toLowerCase()}`,
      description: `${s.requester?.name || "User"} <> ${s.owner?.name || "User"}`,
      createdAt: s.updatedAt || s.createdAt,
      link: "/admin/swaps",
    }));

    const moderationActivity = recentModerationNotifications.map((n) => ({
      id: String(n._id),
      type: "moderation",
      title: n.title || "Moderation event",
      description: n.message || "",
      createdAt: n.createdAt,
      link: "/admin/items?blocked=true",
    }));

    const recentActivity = [...swapActivity, ...moderationActivity]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalItems,
        totalSwaps,
        totalReviews,
        rangeDays,
        trends: {
          users: buildTrend(usersCurrent, usersPrevious),
          items: buildTrend(itemsCurrent, itemsPrevious),
          swaps: buildTrend(swapsCurrent, swapsPrevious),
          reviews: buildTrend(reviewsCurrent, reviewsPrevious),
        },
        moderationQueue: {
          blockedItems,
          suspendedUsers,
          unreadModerationAlerts,
        },
        swapFunnel: {
          requested: funnelRequested,
          accepted: funnelAccepted,
          inLogistics: funnelInLogistics,
          completed: funnelCompleted,
        },
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};


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
