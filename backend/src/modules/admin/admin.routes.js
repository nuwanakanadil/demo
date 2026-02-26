const express = require("express");
const adminController = require("./admin.controller");
const authMiddleware = require("../../middlewares/authMiddleware");
const adminOnly = require("../../middlewares/admin.middleware");

const router = express.Router();

router.get("/dashboard", authMiddleware, adminOnly, adminController.getAdminDashboard);

//user routes
router.get("/users",authMiddleware,adminOnly, adminController.getAllUsers);
router.patch("/users/:email",authMiddleware,adminOnly,adminController.suspendUser);
router.patch("/users/active/:email",authMiddleware,adminOnly,adminController.activeUser);
router.post("/users", authMiddleware,adminOnly,adminController.createUser);

// Items
router.get("/items",authMiddleware,adminOnly, adminController.getAllItems);
router.patch("/items/:id/block",authMiddleware,adminOnly, adminController.updateItemStatus);
router.delete("/items/:id",authMiddleware,adminOnly, adminController.deleteItem);


// Swaps routes
router.get("/swaps", authMiddleware, adminOnly, adminController.getAllSwaps);

//  All reviews
router.get("/reviews",authMiddleware,adminOnly, adminController.getAllReviews);
router.delete("/reviews/:id",authMiddleware,adminOnly, adminController.deleteReview);

module.exports = router;
