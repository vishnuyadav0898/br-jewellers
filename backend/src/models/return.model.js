import mongoose, { Schema } from "mongoose";

const returnItemSchema = new Schema(
  {
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const returnRequestSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    
    itemsToReturn: [returnItemSchema],
    
    reason: { type: String, required: true, trim: true },
    
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "refunded"],
      default: "pending",
    },
    
    adminNote: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("ReturnRequest", returnRequestSchema);
