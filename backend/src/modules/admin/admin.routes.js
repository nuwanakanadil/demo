const express = require("express");
const adminController = require("./admin.controller");
const authMiddleware = require("../../middlewares/authMiddleware");
const adminOnly = require("../../middlewares/admin.middleware");

const router = express.Router();

router.get("/dashboard", authMiddleware, adminOnly, adminController.getAdminDashboard);

//user routes
router.get("/users",authMiddleware,adminOnly, adminController.getAllUsers);
router.post("/users/bulk-status", authMiddleware, adminOnly, adminController.bulkUserStatus);
router.patch("/users/:email",authMiddleware,adminOnly,adminController.suspendUser);
router.patch("/users/active/:email",authMiddleware,adminOnly,adminController.activeUser);
router.post("/users", authMiddleware, adminOnly, adminController.createUserByAdmin);


// Items
router.get("/items",authMiddleware,adminOnly, adminController.getAllItems);
router.post("/items/bulk-block", authMiddleware, adminOnly, adminController.bulkItemBlock);
router.patch("/items/:id/block",authMiddleware,adminOnly, adminController.updateItemStatus);
router.delete("/items/:id",authMiddleware,adminOnly, adminController.deleteItem);


// Swaps routes
router.get("/swaps", authMiddleware, adminOnly, adminController.getAllSwaps);

//  All reviews
router.get("/reviews",authMiddleware,adminOnly, adminController.getAllReviews);
router.delete("/reviews/:id",authMiddleware,adminOnly, adminController.deleteReview);

router.get("/audit-logs", authMiddleware, adminOnly, adminController.getAuditLogs);

module.exports = router;
