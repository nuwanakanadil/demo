module.exports = function requireVerifiedEmail(req, res, next) {
  if (!req.user?.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email to perform this action.",
    });
  }
  next();
};
