const mongoose = require("mongoose");
const Swap = require("./swap.model");
const Apparel = require("../apparel/apparel.model");
const OwnerReview = require("../review/ownerReview.model");

const Logistics = require("../logistics/logistics.model");

const { createNotification } = require("../notification/notification.service");

const PENDING_EXPIRY_DAYS = 7;


function forbidden(msg) {
  const err = new Error(msg);
  err.statusCode = 403;
  return err;
}
function badRequest(msg) {
  const err = new Error(msg);
  err.statusCode = 400;
  return err;
}
function notFound(msg) {
  const err = new Error(msg);
  err.statusCode = 404;
  return err;
}

async function expireStalePendingSwaps() {
  const cutoff = new Date(Date.now() - PENDING_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await Swap.updateMany(
    { status: "PENDING", createdAt: { $lt: cutoff } },
    { $set: { status: "EXPIRED" } },
  );
}

function normalizeSize(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeCondition(value) {
  const map = { NEW: 5, LIKE_NEW: 4, GOOD: 3, FAIR: 2, WORN: 1 };
  return map[String(value || "").toUpperCase()] || 0;
}

function calculateCompatibilityScore(requestedItem, offeredItem) {
  let score = 0;

  // Category affinity
  if (requestedItem?.category && offeredItem?.category) {
    score += requestedItem.category === offeredItem.category ? 35 : 10;
  }

  // Size affinity
  const requestedSize = normalizeSize(requestedItem?.size);
  const offeredSize = normalizeSize(offeredItem?.size);
  if (requestedSize && offeredSize) {
    score += requestedSize === offeredSize ? 30 : 8;
  }

  // Condition proximity
  const requestedCond = normalizeCondition(requestedItem?.condition);
  const offeredCond = normalizeCondition(offeredItem?.condition);
  if (requestedCond && offeredCond) {
    const diff = Math.abs(requestedCond - offeredCond);
    score += Math.max(5, 35 - diff * 8);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * CREATE SWAP
 * - requester cannot request own item
 * - offered item must belong to requester
 * - both items must be available
 * - no duplicate PENDING request for same requester+requestedItem
 */
async function createSwap({
  requesterId,
  requestedItemId,
  offeredItemId,
  message,
}) {
  await expireStalePendingSwaps();

  if (!requestedItemId || !offeredItemId) {
    throw badRequest("requestedItemId and offeredItemId are required.");
  }
  if (requestedItemId === offeredItemId) {
    throw badRequest("Requested item and offered item cannot be the same.");
  }

  const [requestedItem, offeredItem] = await Promise.all([
    Apparel.findById(requestedItemId),
    Apparel.findById(offeredItemId),
  ]);

  if (!requestedItem) throw notFound("Requested item not found.");
  if (!offeredItem) throw notFound("Offered item not found.");

  if (requestedItem.isAvailable === false)
    throw badRequest("Requested item is not available.");
  if (offeredItem.isAvailable === false)
    throw badRequest("Offered item is not available.");

  const requestedOwnerId = String(requestedItem.owner);
  const offeredOwnerId = String(offeredItem.owner);

  if (requestedOwnerId === String(requesterId)) {
    throw badRequest("You cannot request your own item.");
  }
  if (offeredOwnerId !== String(requesterId)) {
    throw forbidden("You can only offer an item that you own.");
  }

  const existing = await Swap.findOne({
    requester: requesterId,
    requestedItem: requestedItemId,
    status: "PENDING",
  });
  if (existing)
    throw badRequest("You already have a pending swap request for this item.");

  const existingPair = await Swap.findOne({
    requester: requesterId,
    requestedItem: requestedItemId,
    offeredItem: offeredItemId,
    status: "PENDING",
  });
  if (existingPair) {
    throw badRequest("You already sent this exact swap request and it is still pending.");
  }

  const pendingFromOfferedItem = await Swap.countDocuments({
    requester: requesterId,
    offeredItem: offeredItemId,
    status: "PENDING",
  });

  if (pendingFromOfferedItem >= 3) {
    throw badRequest("You already have 3 active requests using this offered item. Wait for responses first.");
  }

  const swap = await Swap.create({
    requester: requesterId,
    owner: requestedItem.owner,
    requestedItem: requestedItemId,
    offeredItem: offeredItemId,
    message: message || "",
  });

  await createNotification({
    userId: String(requestedItem.owner), // owner receives
    type: "SWAP_REQUEST",
    title: "New swap request",
    message: `Someone requested "${requestedItem.title}"`,
    link: "/swaps/incoming",
    meta: { swapId: String(swap._id) },
  });

  return swap;
}

async function getIncoming(ownerId) {
  await expireStalePendingSwaps();

  const swaps = await Swap.find({ owner: ownerId })
    .populate("requester", "name email")
    .populate("requestedItem")
    .populate("offeredItem")
    .sort({ createdAt: -1 })
    .lean();

  const requesterIds = [...new Set(swaps.map((s) => String(s.requester?._id)).filter(Boolean))];
  if (requesterIds.length === 0) return swaps;

  // Guard against malformed requester ids from legacy/corrupted records.
  const requesterObjectIds = requesterIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (requesterObjectIds.length === 0) return swaps;

  const [swapStats, ratingStats] = await Promise.all([
    Swap.aggregate([
      { $match: { requester: { $in: requesterObjectIds } } },
      {
        $group: {
          _id: "$requester",
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $in: ["$status", ["CANCELLED", "EXPIRED"]] }, 1, 0] } },
        },
      },
    ]),
    OwnerReview.aggregate([
      { $match: { revieweeId: { $in: requesterObjectIds } } },
      {
        $group: {
          _id: "$revieweeId",
          avgRating: { $avg: "$rating" },
          reviewsCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const statsMap = new Map(swapStats.map((x) => [String(x._id), x]));
  const ratingsMap = new Map(ratingStats.map((x) => [String(x._id), x]));

  return swaps.map((swap) => {
    const requesterId = String(swap.requester?._id || "");
    const s = statsMap.get(requesterId) || { total: 0, completed: 0, rejected: 0, cancelled: 0 };
    const r = ratingsMap.get(requesterId) || { avgRating: 0, reviewsCount: 0 };

    return {
      ...swap,
      compatibilityScore: calculateCompatibilityScore(swap.requestedItem, swap.offeredItem),
      requesterTrust: {
        totalSwaps: s.total,
        completionRate: s.total ? Math.round((s.completed / s.total) * 100) : 0,
        rejectRate: s.total ? Math.round((s.rejected / s.total) * 100) : 0,
        cancelRate: s.total ? Math.round((s.cancelled / s.total) * 100) : 0,
        avgRating: Number((r.avgRating || 0).toFixed(1)),
        reviewsCount: r.reviewsCount || 0,
      },
    };
  });
}

async function getOutgoing(requesterId) {
  await expireStalePendingSwaps();

  return Swap.find({ requester: requesterId })
    .populate("owner", "name email")
    .populate("requestedItem")
    .populate("offeredItem")
    .sort({ createdAt: -1 });
}

async function getByIdForViewer({ swapId, viewerId, viewerRole }) {
  const swap = await Swap.findById(swapId)
    .populate("requester", "name email")
    .populate("owner", "name email")
    .populate("requestedItem")
    .populate("offeredItem")
    .populate("logistics.lastUpdatedBy", "name email");

  if (!swap) throw notFound("Swap request not found.");

  const isParticipant =
    String(swap.owner?._id || swap.owner) === String(viewerId) ||
    String(swap.requester?._id || swap.requester) === String(viewerId);

  if (!isParticipant && viewerRole !== "admin") {
    throw forbidden("You are not allowed to view this swap logistics.");
  }

  return swap;
}

async function updateLogistics({
  swapId,
  userId,
  method,
  meetupLocation,
  meetupAt,
  deliveryOption,
  trackingRef,
  deliveryAddress,
  phoneNumber,
}) {
  const swap = await Swap.findById(swapId);
  if (!swap) throw notFound("Swap request not found.");

  const isParticipant =
    String(swap.owner) === String(userId) || String(swap.requester) === String(userId);
  if (!isParticipant) {
    throw forbidden("Only swap participants can update logistics.");
  }
  if (swap.status !== "ACCEPTED") {
    throw badRequest("Logistics can be edited only when swap is ACCEPTED.");
  }

  if (!["MEETUP", "DELIVERY"].includes(method)) {
    throw badRequest("method must be either MEETUP or DELIVERY.");
  }

  const logistics = swap.logistics || {};
  const existingMethod = logistics.method;
  if (existingMethod && existingMethod !== method) {
    throw badRequest(`Logistics method is already set to ${existingMethod} and cannot be changed.`);
  }
  logistics.method = method;

  if (method === "MEETUP") {
    if (!meetupLocation || !meetupAt) {
      throw badRequest("meetupLocation and meetupAt are required for MEETUP.");
    }
    logistics.meetupLocation = String(meetupLocation).trim();
    logistics.meetupAt = new Date(meetupAt);
    if (Number.isNaN(logistics.meetupAt.getTime())) {
      throw badRequest("Invalid meetupAt date/time.");
    }

    logistics.deliveryOption = undefined;
    logistics.trackingRef = undefined;
    logistics.deliveryAddress = undefined;
    logistics.phoneNumber = undefined;
    logistics.status = "IN_TRANSIT";
  } else {
    if (!deliveryOption) {
      throw badRequest("deliveryOption is required for DELIVERY.");
    }
    const normalizedDeliveryOption = String(deliveryOption).trim();
    const normalizedDeliveryAddress = deliveryAddress ? String(deliveryAddress).trim() : "";
    const normalizedPhoneNumber = phoneNumber ? String(phoneNumber).trim() : "";

    if (["Postal", "Courier"].includes(normalizedDeliveryOption)) {
      if (!normalizedDeliveryAddress || !normalizedPhoneNumber) {
        throw badRequest("deliveryAddress and phoneNumber are required for Postal and Courier delivery options.");
      }
    }

    logistics.deliveryOption = normalizedDeliveryOption;
    logistics.trackingRef = trackingRef ? String(trackingRef).trim() : undefined;
    logistics.deliveryAddress = normalizedDeliveryAddress || undefined;
    logistics.phoneNumber = normalizedPhoneNumber || undefined;

    logistics.meetupLocation = undefined;
    logistics.meetupAt = undefined;
    logistics.status = logistics.trackingRef ? "IN_TRANSIT" : "SCHEDULED";
  }

  logistics.lastUpdatedBy = userId;
  logistics.lastUpdatedAt = new Date();

  swap.logistics = logistics;
  await swap.save();

  await Logistics.updateOne(
    { swap: swap._id },
    {
      $set: {
        swap: swap._id,
        requester: swap.requester,
        owner: swap.owner,
        method: logistics.method,
        meetupLocation: logistics.meetupLocation || null,
        meetupAt: logistics.meetupAt || null,
        deliveryOption: logistics.deliveryOption || null,
        trackingRef: logistics.trackingRef || null,
        deliveryAddress: logistics.deliveryAddress || null,
        phoneNumber: logistics.phoneNumber || null,
        status: logistics.status,
        lastUpdatedBy: logistics.lastUpdatedBy,
        lastUpdatedAt: logistics.lastUpdatedAt,
      },
    },
    { upsert: true }
  );

  return Swap.findById(swap._id)
    .populate("requester", "name email")
    .populate("owner", "name email")
    .populate("requestedItem")
    .populate("offeredItem")
    .populate("logistics.lastUpdatedBy", "name email");
}

/**
 * ACCEPT SWAP (transaction)
 * - only owner can accept
 * - must be PENDING
 * - both items must still be available
 * - reserve BOTH items (isAvailable=false)
 * - cancel other pending swaps for the same requestedItem
 */
async function acceptSwap({ swapId, ownerId }) {
  await expireStalePendingSwaps();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const swap = await Swap.findById(swapId).session(session);
    if (!swap) throw notFound("Swap request not found.");

    if (String(swap.owner) !== String(ownerId)) {
      throw forbidden("Only the item owner can accept this swap.");
    }
    if (swap.status !== "PENDING") {
      throw badRequest(
        `Only PENDING swaps can be accepted. Current status: ${swap.status}`,
      );
    }

    const [requestedItem, offeredItem] = await Promise.all([
      Apparel.findById(swap.requestedItem).session(session),
      Apparel.findById(swap.offeredItem).session(session),
    ]);

    if (!requestedItem) throw notFound("Requested item not found.");
    if (!offeredItem) throw notFound("Offered item not found.");

    if (requestedItem.isAvailable === false)
      throw badRequest("Requested item is no longer available.");
    if (offeredItem.isAvailable === false)
      throw badRequest("Offered item is no longer available.");

    // Reserve both items
    requestedItem.isAvailable = false;
    offeredItem.isAvailable = false;
    await Promise.all([
      requestedItem.save({ session }),
      offeredItem.save({ session }),
    ]);

    // Accept this swap
    swap.status = "ACCEPTED";
    await swap.save({ session });

    await createNotification({
      userId: String(swap.requester),
      type: "SWAP_ACCEPTED",
      title: "Swap accepted ✅",
      message: `Your request for "${requestedItem.title}" was accepted`,
      link: "/swaps/outgoing",
      meta: { swapId: String(swap._id) },
    });

    // Cancel other pending swaps for the same requestedItem
    await Swap.updateMany(
      {
        _id: { $ne: swap._id },
        requestedItem: swap.requestedItem,
        status: "PENDING",
      },
      { $set: { status: "CANCELLED" } },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return swap;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

/**
 * REJECT SWAP
 * - only owner can reject
 * - must be PENDING
 */
async function rejectSwap({ swapId, ownerId }) {
  await expireStalePendingSwaps();

  const swap = await Swap.findById(swapId);
  if (!swap) throw notFound("Swap request not found.");

  if (String(swap.owner) !== String(ownerId)) {
    throw forbidden("Only the item owner can reject this swap.");
  }
  if (swap.status !== "PENDING") {
    throw badRequest(
      `Only PENDING swaps can be rejected. Current status: ${swap.status}`,
    );
  }

  swap.status = "REJECTED";
  await swap.save();

  await createNotification({
    userId: String(swap.requester),
    type: "SWAP_REJECTED",
    title: "Swap rejected ❌",
    message: "Your swap request was rejected",
    link: "/swaps/outgoing",
    meta: { swapId: String(swap._id) },
  });

  return swap;
}

/**
 * COMPLETE SWAP (transaction)
 * Option B (recommended): transfer ownership
 * - owner or requester can complete
 * - must be ACCEPTED
 * - swap item owners
 * - keep items reserved (isAvailable=false). (You can change to true if you want relisting)
 */
async function completeSwap({ swapId, actorId }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const swap = await Swap.findById(swapId).session(session);
    if (!swap) throw notFound("Swap request not found.");

    const isParticipant =
      String(swap.owner) === String(actorId) || String(swap.requester) === String(actorId);
    if (!isParticipant) {
      throw forbidden("Only the owner or requester can mark this as completed.");
    }
    if (swap.status !== "ACCEPTED") {
      throw badRequest(
        `Only ACCEPTED swaps can be completed. Current status: ${swap.status}`,
      );
    }

    const [requestedItem, offeredItem] = await Promise.all([
      Apparel.findById(swap.requestedItem).session(session),
      Apparel.findById(swap.offeredItem).session(session),
    ]);

    if (!requestedItem) throw notFound("Requested item not found.");
    if (!offeredItem) throw notFound("Offered item not found.");

    const oldOwnerId = requestedItem.owner; // owner
    const requesterId = swap.requester; // requester

    // Transfer owners
    requestedItem.owner = requesterId;
    offeredItem.owner = oldOwnerId;

    // Keep as unavailable (already reserved). If you want them available again after swap, set true.
    requestedItem.isAvailable = false;
    offeredItem.isAvailable = false;

    await Promise.all([
      requestedItem.save({ session }),
      offeredItem.save({ session }),
    ]);

    swap.status = "COMPLETED";
    swap.logistics = {
      ...(swap.logistics?.toObject ? swap.logistics.toObject() : swap.logistics),
      status: "DONE",
      lastUpdatedBy: actorId,
      lastUpdatedAt: new Date(),
    };
    await swap.save({ session });


    await Logistics.updateOne(
      { swap: swap._id },
      {
        $set: {
          swap: swap._id,
          requester: swap.requester,
          owner: swap.owner,
          method: swap.logistics?.method || "MEETUP",
          meetupLocation: swap.logistics?.meetupLocation || null,
          meetupAt: swap.logistics?.meetupAt || null,
          deliveryOption: swap.logistics?.deliveryOption || null,
          trackingRef: swap.logistics?.trackingRef || null,
          deliveryAddress: swap.logistics?.deliveryAddress || null,
          phoneNumber: swap.logistics?.phoneNumber || null,
          status: "DONE",
          lastUpdatedBy: actorId,
          lastUpdatedAt: swap.logistics?.lastUpdatedAt || new Date(),
        },
      },
      { upsert: true, session }
    );

    await createNotification({
      userId: String(swap.requester),
      type: "SWAP_COMPLETED",
      title: "Swap completed 🎉",
      message: "Your swap was marked as completed",
      link: "/swaps/history",
      meta: { swapId: String(swap._id) },
    });

    await createNotification({
      userId: String(swap.owner),
      type: "SWAP_COMPLETED",
      title: "Swap completed 🎉",
      message: "You marked a swap as completed",
      link: "/swaps/history",
      meta: { swapId: String(swap._id) },
    });


    await session.commitTransaction();
    session.endSession();

    return swap;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

module.exports = {
  createSwap,
  getIncoming,
  getOutgoing,
  getByIdForViewer,
  updateLogistics,
  acceptSwap,
  rejectSwap,
  completeSwap,
};
