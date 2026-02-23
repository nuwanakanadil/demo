const swapService = require("./swap.service");
const Swap = require("./swap.model");
const { sendSwapRequestEmail, sendSwapStatusEmail } = require("../../utils/mailer");
const { getIO } = require("../../socket");

async function getSwapEmailData(swapId) {
  // We populate only the fields we need for emailing
  const s = await Swap.findById(swapId)
    .populate("requester", "name email")
    .populate("owner", "name email")
    .populate("requestedItem", "title name") // in case your Apparel uses title or name
    .lean();

  return s;
}

exports.createSwap = async (req, res, next) => {
  try {
    const { requestedItemId, offeredItemId, message } = req.body;

    const swap = await swapService.createSwap({
      requesterId: req.user.id,
      requestedItemId,
      offeredItemId,
      message,
    });

    res.status(201).json({ success: true, data: swap });

    // ✅ Send email to OWNER in background (does not block response)
    setImmediate(async () => {
      try {
        const populated = await getSwapEmailData(swap._id || swap.id);

        if (!populated?.owner?.email) return;

        const appUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const linkUrl = `${appUrl}`; // you can change to `${appUrl}/incoming` if you add routing later

        await sendSwapRequestEmail({
          to: populated.owner.email,
          ownerName: populated.owner.name || "User",
          requesterName: populated.requester?.name || "Someone",
          itemName:
            populated.requestedItem?.title ||
            populated.requestedItem?.name ||
            "your item",
          message: populated.message || "",
          linkUrl,
        });
      } catch (e) {
        console.error("Swap request email failed:", e.message);
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getIncoming = async (req, res, next) => {
  try {
    const swaps = await swapService.getIncoming(req.user.id);
    res.json({ success: true, data: swaps });
  } catch (err) {
    next(err);
  }
};

exports.getOutgoing = async (req, res, next) => {
  try {
    const swaps = await swapService.getOutgoing(req.user.id);
    res.json({ success: true, data: swaps });
  } catch (err) {
    next(err);
  }
};

exports.acceptSwap = async (req, res, next) => {
  try {
    const swap = await swapService.acceptSwap({
      swapId: req.params.id,
      ownerId: req.user.id,
    });

    res.json({ success: true, data: swap });

    // ✅ Send email to REQUESTER in background
    setImmediate(async () => {
      try {
        const populated = await getSwapEmailData(swap._id || swap.id);
        if (!populated?.requester?.email) return;

        const appUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const linkUrl = `${appUrl}`;

        await sendSwapStatusEmail({
          to: populated.requester.email,
          requesterName: populated.requester.name || "User",
          itemName:
            populated.requestedItem?.title ||
            populated.requestedItem?.name ||
            "the requested item",
          status: "accepted",
          linkUrl,
        });
      } catch (e) {
        console.error("Swap status email (accepted) failed:", e.message);
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.rejectSwap = async (req, res, next) => {
  try {
    const swap = await swapService.rejectSwap({
      swapId: req.params.id,
      ownerId: req.user.id,
    });

    res.json({ success: true, data: swap });

    // ✅ Send email to REQUESTER in background
    setImmediate(async () => {
      try {
        const populated = await getSwapEmailData(swap._id || swap.id);
        if (!populated?.requester?.email) return;

        const appUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const linkUrl = `${appUrl}`;

        await sendSwapStatusEmail({
          to: populated.requester.email,
          requesterName: populated.requester.name || "User",
          itemName:
            populated.requestedItem?.title ||
            populated.requestedItem?.name ||
            "the requested item",
          status: "rejected",
          linkUrl,
        });
      } catch (e) {
        console.error("Swap status email (rejected) failed:", e.message);
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.completeSwap = async (req, res, next) => {
  try {
    const swap = await swapService.completeSwap({
      swapId: req.params.id,
      ownerId: req.user.id,
    });
    res.json({ success: true, data: swap });
  } catch (err) {
    next(err);
  }
};
