const router = require("express").Router();
const auth = require("../../middlewares/authMiddleware");
const ctrl = require("./wishlist.controller");

router.use(auth);

router.get("/", ctrl.getWishlist);
router.post("/items/:itemId", ctrl.addWishlistItem);
router.delete("/items/:itemId", ctrl.removeWishlistItem);

router.get("/searches", ctrl.getSavedSearches);
router.post("/searches", ctrl.addSavedSearch);
router.delete("/searches/:id", ctrl.deleteSavedSearch);

module.exports = router;
