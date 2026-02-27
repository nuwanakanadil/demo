const router = require("express").Router();
const ctrl = require("./auth.controller");
const auth = require("../../middlewares/authMiddleware");
// const adminAuth = require("../../middlewares/admin.middleware"); // ensure only admins can call

const adminCtrl = require("../admin/admin.controller");

// Public routes
router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.get("/verify-email", ctrl.verifyEmail);
router.get("/me", auth, ctrl.me);
router.patch("/me", auth, ctrl.updateMe); 
router.delete("/me", auth, ctrl.deleteMe);

// Admin routes for user management
// router.patch("/users/:id/suspend", adminAuth, adminCtrl.suspendUser);
// router.patch("/users/:id/ban", adminAuth, adminCtrl.banUser);
// router.patch("/users/:id/activate", adminAuth, adminCtrl.activateUser);
// router.patch("/users/:id/verify-email", adminAuth, adminCtrl.manualVerifyEmail);

module.exports = router;
