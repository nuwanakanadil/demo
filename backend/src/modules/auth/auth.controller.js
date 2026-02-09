const jwt = require("jsonwebtoken");
const User = require("./auth.model");
const crypto = require("crypto");
const { sendVerifyEmail, sendWelcomeEmail } = require("../../utils/mailer");

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function createEmailVerifyToken(user) {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");

  user.emailVerifyTokenHash = hash;
  user.emailVerifyExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  return token;
}

// ---------------- REGISTER ----------------
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      const err = new Error("name, email, password are required");
      err.statusCode = 400;
      throw err;
    }

    const exists = await User.findOne({ email });
    if (exists) {
      const err = new Error("Email already registered");
      err.statusCode = 400;
      throw err;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
    });

    // 🔐 create verification token
    const verifyToken = createEmailVerifyToken(user);
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email to log in.",
    });

    // 📧 send verify email in background
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

// ---------------- LOGIN ----------------
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error("email and password are required");
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      throw err;
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      throw err;
    }

    if (!user.isEmailVerified) {
      const err = new Error("Please verify your email before logging in.");
      err.statusCode = 403;
      throw err;
    }

    const token = signToken(user._id);

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

// ---------------- CURRENT USER ----------------
exports.me = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ---------------- VERIFY EMAIL ----------------
exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token;
    if (!token) {
      const err = new Error("Token required");
      err.statusCode = 400;
      throw err;
    }

    const hash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerifyTokenHash: hash,
      emailVerifyExpires: { $gt: new Date() },
    });

    // if not found, check if already verified
    if (!user) {
      const verified = await User.findOne({ isEmailVerified: true });

      if (verified) {
        return res.json({
          success: true,
          message: "Email already verified. You can log in.",
        });
      }

      const err = new Error("Invalid or expired verification link");
      err.statusCode = 400;
      throw err;
    }

    user.isEmailVerified = true;
    user.emailVerifyTokenHash = undefined;
    user.emailVerifyExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // optional: send welcome email AFTER verification
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
