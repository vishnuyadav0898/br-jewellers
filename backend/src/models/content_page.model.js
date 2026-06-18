import mongoose, { Schema } from "mongoose";

const contentPageSchema = new Schema(
  {
    page: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ContentPage", contentPageSchema);
