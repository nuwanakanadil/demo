const svc = require("./notification.service");

exports.getMyNotifications = async (req, res, next) => {
  try {
    const unreadOnly = req.query.unread === "true";
    const limit = Number(req.query.limit || 30);

    const data = await svc.listMyNotifications(req.user.id, { unreadOnly, limit });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await svc.unreadCount(req.user.id);
    res.json({ success: true, count });
  } catch (e) {
    next(e);
  }
};

exports.markOneRead = async (req, res, next) => {
  try {
    const updated = await svc.markRead(req.user.id, req.params.id);
    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await svc.markAllRead(req.user.id);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};
