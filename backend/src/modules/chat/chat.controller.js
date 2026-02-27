const { Conversation, Message } = require("./chat.models");
const mongoose = require("mongoose");

/* ==================================================
   GET OR CREATE CONVERSATION
   - Ensures only ONE conversation exists between:
       • item
       • two users
   - Uses a stable conversationKey to prevent duplicates
================================================== */
exports.getOrCreateConversation = async (req, res, next) => {
  try {
    const { itemId, ownerId } = req.body;
    const myId = req.user.id;

    // ✅ Stable ordering (important)
    // Prevents duplicate conversations if users reversed
    const ids = [String(myId), String(ownerId)].sort();
    const conversationKey = `${itemId}:${ids.join("_")}`;

    const convo = await Conversation.findOneAndUpdate(
      { conversationKey }, // Unique lookup
      {
        $setOnInsert: {
          itemId,
          participants: [myId, ownerId],
          conversationKey,
        },
      },
      { new: true, upsert: true } // Create if not exists
    );

    res.json({ success: true, data: convo });
  } catch (err) {
    next(err);
  }
};

/* ==================================================
   GET MESSAGES
   - Fetch all messages for a conversation
   - Sorted ascending (oldest → newest)
================================================== */
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

/* ==================================================
   SEND MESSAGE
   - Creates new message
   - Updates conversation preview (for inbox list)
================================================== */
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { text, clientMessageId } = req.body;

    const msg = await Message.create({
      conversationId,
      senderId: req.user.id,
      text,
      clientMessageId, // Stored for optimistic UI matching
    });

    // ✅ Update conversation preview for inbox
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageText: text,
      lastMessageAt: msg.createdAt,
    });

    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
};

/* ==================================================
   LIST MY CONVERSATIONS (INBOX)
   - Returns summarized conversations for logged-in user
   - Includes unread count calculation
================================================== */
exports.listMyConversations = async (req, res, next) => {
  try {
    const myId = req.user.id;

    // Fetch conversations where current user is participant
    const convos = await Conversation.find({ participants: myId })
      .populate("itemId", "title images") // item preview
      .populate("participants", "name")   // participant names
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean(); // Improve performance (plain JS objects)

    // Compute unread count for each conversation
    const results = await Promise.all(
      convos.map(async (c) => {

        // Find lastReadAt record for current user
        const readRec = (c.lastReadAt || []).find(
          (x) => String(x.userId) === String(myId)
        );

        const lastRead = readRec?.at || new Date(0);

        // Count messages:
        // - After lastRead time
        // - Sent by other user (not myself)
        const unreadCount = await Message.countDocuments({
          conversationId: c._id,
          createdAt: { $gt: lastRead },
          senderId: { $ne: myId },
        });

        // Determine "other user" for display
        const other = (c.participants || []).find(
          (p) => String(p._id) !== String(myId)
        );

        // Extract item preview info
        const itemTitle = c.itemId?.title || "Item";
        const itemImage =
          Array.isArray(c.itemId?.images) && c.itemId.images.length > 0
            ? c.itemId.images[0].url
            : null;

        return {
          id: c._id,
          itemId: c.itemId?._id,
          itemTitle,
          itemImage,
          otherUser: other ? { id: other._id, name: other.name } : null,
          lastMessage: c.lastMessageText || "",
          updatedAt: c.lastMessageAt || c.updatedAt,
          unreadCount,
        };
      })
    );

    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

/* ==================================================
   MARK CONVERSATION AS READ
   - Updates lastReadAt timestamp for current user
   - Used when opening chat or receiving new message
================================================== */
exports.markConversationRead = async (req, res, next) => {
  try {
    const myId = req.user.id;
    const { conversationId } = req.params;

    const convo = await Conversation.findById(conversationId);
    if (!convo)
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });

    // Find existing lastReadAt record
    const idx = convo.lastReadAt.findIndex(
      (x) => String(x.userId) === String(myId)
    );

    if (idx >= 0) {
      // Update existing timestamp
      convo.lastReadAt[idx].at = new Date();
    } else {
      // Add new read record for this user
      convo.lastReadAt.push({ userId: myId, at: new Date() });
    }

    await convo.save();

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};