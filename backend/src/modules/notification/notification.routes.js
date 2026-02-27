const router = require("express").Router();
const ctrl = require("./notification.controller");
const auth = require("../../middlewares/authMiddleware"); // adjust name/path if different

router.get("/", auth, ctrl.getMyNotifications);
router.get("/unread-count", auth, ctrl.getUnreadCount);
router.put("/:id/read", auth, ctrl.markOneRead);
router.put("/read-all", auth, ctrl.markAllRead);

module.exports = router;
