import mongoose, { Schema } from "mongoose";

const userDeviceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fcmToken: {
      type: String,
      required: true,
      unique: true
  }
},
  {
     timestamps: true
    }
);

export default mongoose.model("UserDevice", userDeviceSchema);
