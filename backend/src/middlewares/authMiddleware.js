const jwt = require("jsonwebtoken");
const User = require("../modules/auth/auth.model");

module.exports = async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = { id: user._id, role: user.role, email: user.email, name: user.name, isEmailVerified: user.isEmailVerified };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid/expired token" });
  }
};
