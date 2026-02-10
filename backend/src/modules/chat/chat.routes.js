const router = require("express").Router();
const auth = require("../../middlewares/authMiddleware");
const ctrl = require("./chat.controller");

router.get("/conversations", auth, ctrl.listMyConversations); // ✅ inbox list
router.post("/conversations", auth, ctrl.getOrCreateConversation);

router.get("/conversations/:conversationId/messages", auth, ctrl.getMessages);
router.post("/conversations/:conversationId/messages", auth, ctrl.sendMessage);

router.post("/conversations/:conversationId/read", auth, ctrl.markConversationRead); // ✅ mark read

module.exports = router;
