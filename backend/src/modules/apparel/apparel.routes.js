const router = require("express").Router();
const ctrl = require("./apparel.controller");
const auth = require("../../middlewares/authMiddleware");
const requireVerified = require("../../middlewares/requireVerifiedEmail");
const upload = require("../../middlewares/uploadMiddleware");

// Public browse
router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);

// Protected - my items (auth only, verified not required to view own list)
router.get("/me/mine", auth, ctrl.myItems);

// Protected CRUD (email verification REQUIRED)
router.post(
  "/",
  auth,
  requireVerified,
  upload.array("images", 5),
  ctrl.create
);

router.put(
  "/:id",
  auth,
  requireVerified,
  upload.array("images", 5),
  ctrl.update
);

router.delete(
  "/:id",
  auth,
  requireVerified,
  ctrl.remove
);

module.exports = router;
