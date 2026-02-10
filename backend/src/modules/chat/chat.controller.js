const { Conversation, Message } = require("./chat.models");
const mongoose = require("mongoose");

exports.getOrCreateConversation = async (req, res, next) => {
  try {
    const { itemId, ownerId } = req.body;
    const myId = req.user.id;

    // ✅ stable ordering (important)
    const ids = [String(myId), String(ownerId)].sort();
    const conversationKey = `${itemId}:${ids.join("_")}`;

    const convo = await Conversation.findOneAndUpdate(
      { conversationKey }, // ✅ unique lookup
      {
        $setOnInsert: {
          itemId,
          participants: [myId, ownerId],
          conversationKey,
        },
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: convo });
  } catch (err) {
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { text, clientMessageId } = req.body;

    const msg = await Message.create({
      conversationId,
      senderId: req.user.id,
      text,
      clientMessageId, // ✅ store it
    });
    // ✅ update conversation preview for inbox
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageText: text,
      lastMessageAt: msg.createdAt,
    });

    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
};

exports.listMyConversations = async (req, res, next) => {
  try {
    const myId = req.user.id;

    // ✅ Fetch conversations where I'm a participant
    const convos = await Conversation.find({ participants: myId })
      .populate("itemId", "title images") // item preview (optional)
      .populate("participants", "name")   // show other user name (optional)
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    // ✅ For each convo compute unreadCount = messages after my lastReadAt
    const results = await Promise.all(
      convos.map(async (c) => {
        const readRec = (c.lastReadAt || []).find(
          (x) => String(x.userId) === String(myId)
        );
        const lastRead = readRec?.at || new Date(0);

        const unreadCount = await Message.countDocuments({
          conversationId: c._id,
          createdAt: { $gt: lastRead },
          senderId: { $ne: myId }, // only count messages from others
        });

        // find "other user" for display
        const other = (c.participants || []).find((p) => String(p._id) !== String(myId));

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

exports.markConversationRead = async (req, res, next) => {
  try {
    const myId = req.user.id;
    const { conversationId } = req.params;

    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ success: false, message: "Conversation not found" });

    // ✅ Update lastReadAt for this user
    const idx = convo.lastReadAt.findIndex((x) => String(x.userId) === String(myId));
    if (idx >= 0) {
      convo.lastReadAt[idx].at = new Date();
    } else {
      convo.lastReadAt.push({ userId: myId, at: new Date() });
    }

    await convo.save();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
