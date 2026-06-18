import mongoose, { Schema } from "mongoose";

const couponSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },
    
    discountType: { 
      type: String, 
      enum: ["percentage", "fixed"], 
      required: true 
    },
    discountValue: { type: Number }, // Only used if type is "percentage"
    fixedDiscountValue: {
      INR: { type: Number },
      USD: { type: Number },
    }, // Used if type is "fixed"
    
    maxDiscount: {
      INR: { type: Number },
      USD: { type: Number },
    }, // Optional cap for percentage discounts
    
    minOrderAmount: {
      INR: { type: Number, default: 0 },
      USD: { type: Number, default: 0 },
    },
    
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    
    // Restrictions
    applicableMaterials: [{ type: String, lowercase: true, trim: true }], // Matches SKU
    applicableCategories: [{ type: String, trim: true }],
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    applicableOnOrderNumber: { type: Number, default: null }, // e.g., 1 for First Order, 3 for Third Order
    
    // Usage Rules
    usageLimit: { type: Number, default: null }, // Total times coupon can be used by anyone
    usagePerUser: { type: Number, default: 1 }, // Max times a single user can use it
    totalUsedCount: { type: Number, default: 0 }, // Analytics tracking
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
