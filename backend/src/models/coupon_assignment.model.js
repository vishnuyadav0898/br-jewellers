import mongoose, { Schema } from "mongoose";

const couponAssignmentSchema = new Schema(
  {
    coupon: { type: Schema.Types.ObjectId, ref: "Coupon", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isUsed: { type: Boolean, default: false },
    usedAt: { type: Date },
  },
  { timestamps: true }
);

// A user should only be assigned a specific coupon once
couponAssignmentSchema.index({ coupon: 1, user: 1 }, { unique: true });

export default mongoose.model("CouponAssignment", couponAssignmentSchema);
