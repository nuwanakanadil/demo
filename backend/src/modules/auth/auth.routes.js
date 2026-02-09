const router = require("express").Router();
const ctrl = require("./auth.controller");
const auth = require("../../middlewares/authMiddleware");

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.get("/verify-email", ctrl.verifyEmail);
router.get("/me", auth, ctrl.me);

module.exports = router;
