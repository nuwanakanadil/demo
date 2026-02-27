const jwt = require("jsonwebtoken");
const User = require("./auth.model");
const crypto = require("crypto");
const { sendVerifyEmail, sendWelcomeEmail } = require("../../utils/mailer");

/* --------------------------------------------------
   JWT TOKEN GENERATION
   - Creates signed JWT containing user ID
   - Expiration time comes from .env (default 7 days)
-------------------------------------------------- */
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

/* --------------------------------------------------
   EMAIL VERIFICATION TOKEN GENERATOR
   - Creates random token (sent to user)
   - Stores HASH of token in database (security best practice)
   - Sets expiry time (30 minutes)
-------------------------------------------------- */
function createEmailVerifyToken(user) {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");

  user.emailVerifyTokenHash = hash;
  user.emailVerifyExpires = new Date(Date.now() + 30 * 60 * 1000);

  return token; // raw token sent via email
}

/* ==================================================
   REGISTER
================================================== */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !normalizedEmail || !password) {
      const err = new Error("name, email, password are required");
      err.statusCode = 400;
      throw err;
    }

    // Check if email already exists
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      const err = new Error("Email already registered");
      err.statusCode = 400;
      throw err;
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
    });

    // Create verification token
    const verifyToken = createEmailVerifyToken(user);
    await user.save({ validateBeforeSave: false });

    // Send success response immediately
    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email to log in.",
    });

    // Send verification email asynchronously
    setImmediate(async () => {
      try {
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;
        await sendVerifyEmail(user.email, user.name, verifyUrl);
      } catch (e) {
        console.error("Verify email failed:", e.message);
      }
    });
  } catch (err) {
    next(err);
  }
};

/* ==================================================
   LOGIN
================================================== */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!normalizedEmail || !password) {
      const err = new Error("email and password are required");
      err.statusCode = 400;
      throw err;
    }

    // Find user + include password field
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      throw err;
    }

    // Compare password
    const ok = await user.comparePassword(password);
    if (!ok)
      throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

    // Check email verification
    if (!user.isEmailVerified)
      throw Object.assign(
        new Error("Please verify your email before logging in."),
        { statusCode: 403 }
      );

    // Check account status
    if (user.accountStatus === "suspended")
      throw Object.assign(new Error("Your account has been suspended."), { statusCode: 403 });

    if (user.accountStatus === "banned")
      throw Object.assign(new Error("Your account has been banned."), { statusCode: 403 });

    // Generate JWT token
    const token = signToken(user._id);

    // Send response
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ==================================================
   GET CURRENT USER
   - Returns authenticated user (from auth middleware)
================================================== */
exports.me = async (req, res) => {
  res.json({ success: true, user: req.user });
};

/* ==================================================
   VERIFY EMAIL
   - Receives token from frontend
   - Hashes it
   - Finds matching user
   - Marks email as verified
================================================== */
exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token;
    if (!token)
      throw Object.assign(new Error("Token required"), { statusCode: 400 });

    const hash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerifyTokenHash: hash,
      emailVerifyExpires: { $gt: new Date() },
    });

    // If token invalid/expired
    if (!user) {
      const verified = await User.findOne({ isEmailVerified: true });
      if (verified)
        return res.json({
          success: true,
          message: "Email already verified. You can log in.",
        });

      throw Object.assign(
        new Error("Invalid or expired verification link"),
        { statusCode: 400 }
      );
    }

    // Mark verified
    user.isEmailVerified = true;
    user.emailVerifyTokenHash = undefined;
    user.emailVerifyExpires = undefined;

    await user.save({ validateBeforeSave: false });

    // Send welcome email asynchronously
    setImmediate(async () => {
      try {
        await sendWelcomeEmail(
          user.email,
          user.name,
          process.env.FRONTEND_URL
        );
      } catch (e) {
        console.error("Welcome email failed:", e.message);
      }
    });

    res.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
};

/* ==================================================
   DELETE CURRENT USER
   - Deletes logged-in user's account
================================================== */
exports.deleteMe = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/* ==================================================
   UPDATE CURRENT USER
   - Allows updating:
       • name
       • password (optional)
   - Validates password confirmation
================================================== */
exports.updateMe = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const { name, newPassword, confirmPassword } = req.body;

    const updates = {};

    // Update name if provided
    if (name && name.trim()) updates.name = name.trim();

    // Optional password change
    if (newPassword || confirmPassword) {
      if (!newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Fill both newPassword and confirmPassword",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      updates.password = newPassword;
    }

    const user = await User.findById(userId).select("+password");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (updates.name) user.name = updates.name;
    if (updates.password) user.password = updates.password;

    await user.save(); // triggers password hashing in schema

    res.json({
      success: true,
      message: "Profile updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};