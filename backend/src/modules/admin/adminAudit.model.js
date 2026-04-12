const mongoose = require("mongoose");

const adminAuditSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true, trim: true },
    targetType: { type: String, required: true, trim: true },
    targetId: { type: String, default: "" },
    targetLabel: { type: String, default: "" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

adminAuditSchema.index({ createdAt: -1 });
adminAuditSchema.index({ actorId: 1, createdAt: -1 });

module.exports = mongoose.model("AdminAudit", adminAuditSchema);
