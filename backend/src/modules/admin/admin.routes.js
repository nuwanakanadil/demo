const express = require("express");
const adminController = require("./admin.controller");

// Correct relative paths
const authMiddleware = require('../../middlewares/authMiddleware');

const adminOnly = require("../../middlewares/admin.middleware");

const router = express.Router();

// Dashboard
router.get("/dashboard", authMiddleware, adminOnly, adminController.dashboard);

// Users
router.get("/users", authMiddleware, adminOnly, adminController.getAllUsers);
router.delete("/users/:id", authMiddleware, adminOnly, adminController.deleteUser);

// Items
router.get("/items", authMiddleware, adminOnly, adminController.getAllItems);
router.delete("/items/:id", authMiddleware, adminOnly, adminController.deleteItem);

// Swaps
router.get("/swaps", authMiddleware, adminOnly, adminController.getAllSwaps);

// Reviews
router.get("/reviews", authMiddleware, adminOnly, adminController.getAllReviews);

module.exports = router;
