const swapService = require("./swap.service");
const Swap = require("./swap.model");
const {
  sendSwapRequestEmail,
  sendSwapStatusEmail,
  sendSwapLogisticsEmail,
  sendSwapCompletedEmail,
} = require("../../utils/mailer");

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

exports.getLogistics = async (req, res, next) => {
  try {
    const swap = await swapService.getByIdForViewer({
      swapId: req.params.id,
      viewerId: req.user.id,
      viewerRole: req.user.role,
    });
    res.json({ success: true, data: swap });
  } catch (err) {
    next(err);
  }
};

exports.updateLogistics = async (req, res, next) => {
  try {
    const { method, meetupLocation, meetupAt, deliveryOption, trackingRef, deliveryAddress, phoneNumber } = req.body || {};
    const swap = await swapService.updateLogistics({
      swapId: req.params.id,
      userId: req.user.id,
      method,
      meetupLocation,
      meetupAt,
      deliveryOption,
      trackingRef,
      deliveryAddress,
      phoneNumber,
    });
    res.json({ success: true, data: swap });

    // Send logistics update email(s) in background
    setImmediate(async () => {
      try {
        const appUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const linkUrl = `${appUrl}/swaps/${swap._id || req.params.id}/logistics`;

        const requester = swap?.requester || {};
        const owner = swap?.owner || {};
        const updater = swap?.logistics?.lastUpdatedBy || {};
        const updatedByName = updater?.name || "A participant";

        const recipients = [requester, owner].filter(
          (u) => u?.email && String(u?._id) !== String(req.user.id)
        );

        await Promise.all(
          recipients.map((recipient) =>
            sendSwapLogisticsEmail({
              to: recipient.email,
              recipientName: recipient.name || "User",
              updatedByName,
              method: swap?.logistics?.method,
              meetupLocation: swap?.logistics?.meetupLocation,
              meetupAt: swap?.logistics?.meetupAt
                ? new Date(swap.logistics.meetupAt).toLocaleString()
                : "",
              deliveryOption: swap?.logistics?.deliveryOption,
              trackingRef: swap?.logistics?.trackingRef,
              deliveryAddress: swap?.logistics?.deliveryAddress,
              phoneNumber: swap?.logistics?.phoneNumber,
              linkUrl,
            })
          )
        );
      } catch (e) {
        console.error("Swap logistics email failed:", e.message);
      }
    });
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
      actorId: req.user.id,
    });
    res.json({ success: true, data: swap });

    // Send completion email to both participants in background
    setImmediate(async () => {
      try {
        const populated = await Swap.findById(swap._id || swap.id)
          .populate("requester", "name email")
          .populate("owner", "name email")
          .populate("requestedItem", "title name")
          .populate("offeredItem", "title name")
          .lean();

        if (!populated) return;

        const appUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const linkUrl = `${appUrl}/swaps/${populated._id}/logistics`;
        const requestedItemName =
          populated.requestedItem?.title || populated.requestedItem?.name || "Requested item";
        const offeredItemName =
          populated.offeredItem?.title || populated.offeredItem?.name || "Offered item";

        const recipients = [
          {
            to: populated.requester?.email,
            recipientName: populated.requester?.name || "User",
            otherPartyName: populated.owner?.name || "the other user",
          },
          {
            to: populated.owner?.email,
            recipientName: populated.owner?.name || "User",
            otherPartyName: populated.requester?.name || "the other user",
          },
        ].filter((r) => r.to);

        await Promise.all(
          recipients.map((r) =>
            sendSwapCompletedEmail({
              to: r.to,
              recipientName: r.recipientName,
              otherPartyName: r.otherPartyName,
              requestedItemName,
              offeredItemName,
              linkUrl,
            })
          )
        );
      } catch (e) {
        console.error("Swap completion email failed:", e.message);
      }
    });
  } catch (err) {
    next(err);
  }
};
