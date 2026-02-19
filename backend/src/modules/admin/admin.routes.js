const express = require("express");
const adminController = require("./admin.controller");
const authMiddleware = require("../../middlewares/authMiddleware");
const adminOnly = require("../../middlewares/admin.middleware");

// Correct relative paths
// const authMiddleware = require('../../middlewares/authMiddleware');

// const adminOnly = require("../../middlewares/admin.middleware");

const router = express.Router();

// Dashboard
// router.get("/dashboard", authMiddleware, adminOnly, adminController.dashboard);

// Users
// router.use(authMiddleware, adminOnly);
router.get("/users", adminController.getAllUsers);
router.delete("/users/:id", adminController.deleteItem);

// Items
router.get("/items", adminController.getAllItems);
router.patch("/items/:id/block", adminController.updateItemStatus);
router.delete("/items/:id", adminController.deleteItem);


// Swaps
// router.get("/swaps", authMiddleware, adminOnly, adminController.getAllSwaps);

//  All reviews
router.get("/reviews", adminController.getAllReviews);
router.delete("/reviews/:id", adminController.deleteReview);

module.exports = router;
