import mongoose, { Schema } from "mongoose";

const couponUsageSchema = new Schema(
  {
    coupon: { type: Schema.Types.ObjectId, ref: "Coupon", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    
    discountAmount: {
      INR: { type: Number },
      USD: { type: Number },
    },
  },
  { timestamps: true }
);

export default mongoose.model("CouponUsage", couponUsageSchema);
