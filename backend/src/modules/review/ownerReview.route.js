const router = require("express").Router();
const auth = require("../../middlewares/authMiddleware");
const requireVerified = require("../../middlewares/requireVerifiedEmail");
const ctrl = require("./ownerReview.controller");

router.get("/users/:userId/reviews", ctrl.listForOwner);
router.post("/users/:userId/reviews", auth, requireVerified, ctrl.addForOwner);

module.exports = router;
