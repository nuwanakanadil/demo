const Swap = require("./swap.model");

// ⚠️ Update this path/name to match your apparel model file
const Apparel = require("../apparel/apparel.model"); 

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

async function createSwap({ requesterId, requestedItemId, offeredItemId, message }) {
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

  // Must be available
  if (requestedItem.isAvailable === false) throw badRequest("Requested item is not available.");
  if (offeredItem.isAvailable === false) throw badRequest("Offered item is not available.");

  // Ownership rules
  const requestedOwnerId = String(requestedItem.owner);
  const offeredOwnerId = String(offeredItem.owner);

  if (requestedOwnerId === String(requesterId)) {
    throw badRequest("You cannot request your own item.");
  }
  if (offeredOwnerId !== String(requesterId)) {
    throw forbidden("You can only offer an item that you own.");
  }

  // Prevent duplicate pending request by same requester for same requested item
  const existing = await Swap.findOne({
    requester: requesterId,
    requestedItem: requestedItemId,
    status: "PENDING",
  });
  if (existing) throw badRequest("You already have a pending swap request for this item.");

  const swap = await Swap.create({
    requester: requesterId,
    owner: requestedItem.owner,
    requestedItem: requestedItemId,
    offeredItem: offeredItemId,
    message: message || "",
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

async function acceptSwap({ swapId, ownerId }) {
  const swap = await Swap.findById(swapId);
  if (!swap) throw notFound("Swap request not found.");

  if (String(swap.owner) !== String(ownerId)) {
    throw forbidden("Only the item owner can accept this swap.");
  }
  if (swap.status !== "PENDING") {
    throw badRequest(`Only PENDING swaps can be accepted. Current status: ${swap.status}`);
  }

  // Ensure requested item still available
  const requestedItem = await Apparel.findById(swap.requestedItem);
  if (!requestedItem) throw notFound("Requested item not found.");
  if (requestedItem.isAvailable === false) throw badRequest("Requested item is no longer available.");

  // Reserve requested item so no one else can swap it now
  requestedItem.isAvailable = false;
  await requestedItem.save();

  swap.status = "ACCEPTED";
  await swap.save();

  return swap;
}

async function rejectSwap({ swapId, ownerId }) {
  const swap = await Swap.findById(swapId);
  if (!swap) throw notFound("Swap request not found.");

  if (String(swap.owner) !== String(ownerId)) {
    throw forbidden("Only the item owner can reject this swap.");
  }
  if (swap.status !== "PENDING") {
    throw badRequest(`Only PENDING swaps can be rejected. Current status: ${swap.status}`);
  }

  swap.status = "REJECTED";
  await swap.save();

  return swap;
}

async function completeSwap({ swapId, ownerId }) {
  const swap = await Swap.findById(swapId);
  if (!swap) throw notFound("Swap request not found.");

  if (String(swap.owner) !== String(ownerId)) {
    throw forbidden("Only the item owner can mark this as completed.");
  }
  if (swap.status !== "ACCEPTED") {
    throw badRequest(`Only ACCEPTED swaps can be completed. Current status: ${swap.status}`);
  }

  swap.status = "COMPLETED";
  await swap.save();

  return swap;
}

module.exports = {
  createSwap,
  getIncoming,
  getOutgoing,
  acceptSwap,
  rejectSwap,
  completeSwap,
};
