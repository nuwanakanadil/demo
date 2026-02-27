const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/* ==================================================
   USER SCHEMA
   - Defines structure of User document in MongoDB
   - Includes authentication, roles, and email verification fields
================================================== */
const userSchema = new mongoose.Schema(
  {
    /* ---------------- BASIC INFO ---------------- */

    // User's display name
    name: { type: String, required: true, trim: true },

    // Email must be unique and stored in lowercase
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    /* ---------------- AUTHENTICATION ---------------- */

    // Password:
    // - minimum length 6
    // - select: false → NOT returned by default in queries
    //   (prevents accidental exposure)
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    /* ---------------- ROLE SYSTEM ---------------- */

    // Role determines user permissions
    // - user → normal user
    // - admin → can manage system
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    /* ---------------- EMAIL VERIFICATION ---------------- */

    // Indicates whether user has verified email
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    /* ---------------- ACCOUNT STATUS ---------------- */

    // Admin can suspend or ban user
    // - active → normal access
    // - suspended → temporary block
    // - banned → permanent block
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
    },

    /* ---------------- EMAIL VERIFICATION TOKEN ---------------- */

    // Stores HASH of verification token (never store raw token)
    emailVerifyTokenHash: { type: String },

    // Expiration time for verification token
    emailVerifyExpires: { type: Date },
  },
  {
    // Automatically adds:
    // - createdAt
    // - updatedAt
    timestamps: true,
  }
);

/* ==================================================
   PASSWORD HASHING (PRE-SAVE HOOK)
   - Runs automatically before saving user
   - Only hashes password if it was modified
   - Prevents double hashing
================================================== */
userSchema.pre("save", async function () {
  // If password was not changed, skip hashing
  if (!this.isModified("password")) return;

  // Generate salt (cost factor 10)
  const salt = await bcrypt.genSalt(10);

  // Hash password and store hashed version
  this.password = await bcrypt.hash(this.password, salt);
});

/* ==================================================
   PASSWORD COMPARISON METHOD
   - Used during login
   - Compares plain text password with hashed password
   - Returns true/false
================================================== */
userSchema.methods.comparePassword = async function (candidatePassword) {
  // password is selected in controller? If not, ensure select("+password") when needed
  return bcrypt.compare(candidatePassword, this.password);
};

/* ==================================================
   EXPORT MODEL
   - Makes User model available to controllers
================================================== */
module.exports = mongoose.model("User", userSchema);