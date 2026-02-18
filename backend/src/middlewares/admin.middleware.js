// Checks if the user is admin
module.exports = function adminOnly(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access only" });
    }

    next(); // user is admin, allow
  } catch (err) {
    next(err);
  }
};
