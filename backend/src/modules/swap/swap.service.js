const mongoose = require("mongoose");
const Swap = require("./swap.model");
const Apparel = require("../apparel/apparel.model");
const { createNotification } = require("../notification/notification.service");

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
  return Swap.find({ owner: ownerId })
    .populate("requester", "name email")
    .populate("requestedItem")
    .populate("offeredItem")
    .sort({ createdAt: -1 });
}

async function getOutgoing(requesterId) {
  return Swap.find({ requester: requesterId })
    .populate("owner", "name email")
    .populate("requestedItem")
    .populate("offeredItem")
    .sort({ createdAt: -1 });
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
 * - only owner can complete
 * - must be ACCEPTED
 * - swap item owners
 * - keep items reserved (isAvailable=false). (You can change to true if you want relisting)
 */
async function completeSwap({ swapId, ownerId }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const swap = await Swap.findById(swapId).session(session);
    if (!swap) throw notFound("Swap request not found.");

    if (String(swap.owner) !== String(ownerId)) {
      throw forbidden("Only the item owner can mark this as completed.");
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
    await swap.save({ session });

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
  acceptSwap,
  rejectSwap,
  completeSwap,
};
