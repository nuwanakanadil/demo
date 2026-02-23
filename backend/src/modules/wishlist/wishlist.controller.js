const Apparel = require("../apparel/apparel.model");
const Wishlist = require("./wishlist.model");
const mongoose = require("mongoose");

function normalizeFilters(input = {}) {
  return {
    category: input.category || "all",
    size: input.size || "all",
    condition: input.condition || "all",
    dateFrom: input.dateFrom || "",
    dateTo: input.dateTo || "",
  };
}

exports.getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .select("itemIds")
      .populate({
        path: "itemIds",
        populate: { path: "owner", select: "name email" },
      });

    const cleanItems = (wishlist?.itemIds || []).filter(Boolean);
    res.json({ success: true, data: cleanItems });
  } catch (err) {
    next(err);
  }
};

exports.addWishlistItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: "Invalid item id." });
    }
    const item = await Apparel.findById(itemId).select("owner");
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    if (String(item.owner) === String(req.user.id)) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot save your own item." });
    }

    const updated = await Wishlist.findOneAndUpdate(
      { user: req.user.id },
      {
        $setOnInsert: { user: req.user.id },
        $addToSet: { itemIds: item._id },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: "Item saved to wishlist.",
      data: updated?.itemIds || [],
    });
  } catch (err) {
    next(err);
  }
};

exports.removeWishlistItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: "Invalid item id." });
    }

    const itemObjectId = new mongoose.Types.ObjectId(itemId);

    const updated = await Wishlist.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { itemIds: itemObjectId } },
      { new: true }
    );

    res.json({
      success: true,
      message: "Item removed from wishlist.",
      data: updated?.itemIds || [],
    });
  } catch (err) {
    next(err);
  }
};

exports.getSavedSearches = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).select(
      "savedSearches"
    );
    const searches = [...(wishlist?.savedSearches || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json({ success: true, data: searches });
  } catch (err) {
    next(err);
  }
};

exports.addSavedSearch = async (req, res, next) => {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Search name is required." });
    }

    const filters = normalizeFilters(req.body?.filters);

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, itemIds: [], savedSearches: [] });
    }
    wishlist.savedSearches.push({ name, filters });
    await wishlist.save();

    const created = wishlist.savedSearches[wishlist.savedSearches.length - 1];
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
};

exports.deleteSavedSearch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user.id }).select(
      "savedSearches"
    );
    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Saved search not found." });
    }

    const before = wishlist.savedSearches.length;
    wishlist.savedSearches = wishlist.savedSearches.filter(
      (s) => String(s._id) !== String(id)
    );

    if (wishlist.savedSearches.length === before) {
      return res
        .status(404)
        .json({ success: false, message: "Saved search not found." });
    }

    await wishlist.save();
    res.json({ success: true, message: "Saved search deleted." });
  } catch (err) {
    next(err);
  }
};
