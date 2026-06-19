import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: "User",
      index: true 
    }, // If null, it's a broadcast to ALL users
    
    title: { type: String, required: true },
    message: { type: String, required: true },
    
    type: { 
      type: String, 
      enum: ["order", "promotion", "coupon", "system"],
      default: "system"
    },
    
    relatedId: { type: Schema.Types.ObjectId }, // E.g., Order ID or Coupon ID
    
    imageUrl: { type: String } // For rich push notifications
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
