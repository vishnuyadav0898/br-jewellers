import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },

    coverImage: {
      type: String,
      required: true,
      trim: true,
    },

    images: [
      {
        type: String,
      },
    ],

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    gemstone: {
      type: String,
      required: true,
      trim: true,
    },

    occasions: [
      {
        type: String,
        trim: true,
      },
    ],

    category: {
      type: String,
      trim: true,
    },

    priceRange: {
      min: {
        type: Number,
        default: 0,
      },

      max: {
        type: Number,
        default: 0,
      },
    },

    variants: {
      type: [Object],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Product", productSchema);
