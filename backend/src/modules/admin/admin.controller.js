import Apparel from "../apparel/apparel.model.js";
import User from "../auth/auth.model.js";
import OwnerReview from "../review/ownerReview.model.js";
import deleteFromCloudinary from "../../utils/cloudinaryDelete.js";
import Swap from "../swap/swap.model.js";


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

    const totalUsers = await User.countDocuments({ role: "user" });

    const userList = await User.find({ role: "user" })
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





export const suspendUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { accountStatus: "suspended" },
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
      { $set: { isBlocked: true } }
    );

    res.status(200).json({
      success: true,
      message: "User suspended and all items blocked",
      data: user
    });

  } catch (error) {
    next(error);
  }
};


export const activeUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { accountStatus: "active" },
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

    await item.deleteOne();

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



// // ---------------- REVIEWS ----------------
// Get all reviews
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

      if (req.query.reviewrEmail) {
      const reviewer = await User.findOne({
        email: req.query.revieweeEmail.toLowerCase().trim()
      });

      if (!reviewer) {
        return res.status(404).json({
          success: false,
          message: "Reviewee not found"
        });
      }

      filter.reviewerId = reviewer._id;
    }

    const totalReviews = await OwnerReview.countDocuments(filter);

    const reviews = await OwnerReview.find(filter)
      .select("rating comment revieweeId createdAt") // only needed fields
      .populate("revieweeId", "name email") // show email
      .populate("reviwerId","name email")
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

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });

  } catch (err) {
    next(err);
  }
}

//from admin dashboard
export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalItems = await Apparel.countDocuments();
    const totalSwaps = await Swap.countDocuments();
    const totalReviews = await OwnerReview.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalItems,
        totalSwaps,
        totalReviews,
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
