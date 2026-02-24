const Notification = require("./notification.model");

async function createNotification({ userId, type, title, message, link, meta }) {
  return Notification.create({
    user: userId,
    type,
    title,
    message: message || "",
    link: link || "",
    meta: meta || {},
  });
}

async function listMyNotifications(userId, { unreadOnly = false, limit = 30 } = {}) {
  const filter = { user: userId };
  if (unreadOnly) filter.isRead = false;

  return Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);
}

async function markRead(userId, notificationId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
}

async function markAllRead(userId) {
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
  return { success: true };
}

async function unreadCount(userId) {
  const count = await Notification.countDocuments({ user: userId, isRead: false });
  return count;
}

module.exports = {
  createNotification,
  listMyNotifications,
  markRead,
  markAllRead,
  unreadCount,
};
