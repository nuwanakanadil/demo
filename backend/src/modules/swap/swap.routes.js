const router = require("express").Router();
const ctrl = require("./swap.controller");
const auth = require("../../middlewares/authMiddleware");
const requireVerified = require("../../middlewares/requireVerifiedEmail");

// All swap routes require auth
router.use(auth);

// Create swap request (verified users only)
router.post("/", requireVerified, ctrl.createSwap);

// Lists (viewing is allowed once logged in)
router.get("/incoming", ctrl.getIncoming);
router.get("/outgoing", ctrl.getOutgoing);
router.get("/:id/logistics", ctrl.getLogistics);
router.put("/:id/logistics", requireVerified, ctrl.updateLogistics);

// Actions (verified users only)
router.put("/:id/accept", requireVerified, ctrl.acceptSwap);
router.put("/:id/reject", requireVerified, ctrl.rejectSwap);
router.put("/:id/complete", requireVerified, ctrl.completeSwap);

module.exports = router;
